/**
 * Created by shuding on 11/25/15.
 * <ds303077135@gmail.com>
 */

var app = angular.module('sc', ['ngAnimate']);

app.controller('main', ['$scope', '$sce', mainCtrl]);

function mainCtrl($scope, $sce) {
    var fileSelector           = document.createElement('input');
    fileSelector.style.display = 'none';
    fileSelector.setAttribute('type', 'file');
    fileSelector.addEventListener('change', function (event) {
        var files = event.target.files;
        for (var i = 0; i < files.length; ++i) {
            var file   = files[i];

            // 2MB
            if (file.size > 2097152) {
                alert('File size exceeded 2MB!');
                return;
            }

            var reader = new FileReader();

            reader.onload = function (e) {
                $scope.input = e.target.result;
                $scope.submit();
            };

            reader.readAsDataURL(file);
        }
    });

    document.body.appendChild(fileSelector);

    $scope.state    = true;
    $scope.input    = '';
    $scope.msgList  = [];
    $scope.userList = {};
    $scope.isLogin  = false;
    $scope.data     = {
        username: '',
        addr:     '',
        emoji:    ['1f602', '1f603', '1f60e', '1f61c', '1f62a', '1f62d', '1f618', '1f624', '1f612', '1f613']
    };

    ipc.on('connect', function () {
        $scope.state = true;

        $({
            type:    'login',
            content: {
                name: $scope.data.username
            }
        }, function (err) {
            if (err) {
                return alert(err);
            }
            $scope.isLogin = true;
            $scope.$apply();
        });

        $scope.$apply();
    });
    ipc.on('error', function () {
        $scope.state = false;
        $scope.$apply();
        setTimeout(function () {
            $scope.connect();
        }, 800);
    });
    ipc.on('disconnect', function () {
        $scope.state = false;
        $scope.$apply();
        setTimeout(function () {
            $scope.connect();
        }, 800);
    });
    ipc.on('push', function (data) {
        switch (data.content.type) {
            case 'syncuser':
                $scope.userList = data.content.data;
                $scope.$apply();
                break;
            case 'msg':
                $scope.handleMsg(data.content.data);
        }
    });

    $scope.handleMsg = function (data) {
        if (data.data.startsWith('data:image/')) {
            // Image
            data.data = '<img src="' + data.data + '">';
        }
        data.data = data.data.replace(/:(.....):/g, function (a, b) {
        	return ' <img class="emoji-icon" src="' + b + '.png">';
        });
        $scope.msgList.push(data);
        $scope.$apply();
    };

    $scope.display = function (data) {
        var name = data.name;
        var time = new Date(data.time);
        var cont = decodeURI(data.data);
        if (name == $scope.data.username) {
            html = '<span class="msg-sender msg-self">' + name + ' @ ' + (time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds()) + '</span>' + '<span class="msg-content msg-self">' + cont + '</span>';
        } else {
            html = '<span class="msg-sender">' + name + ' @ ' + (time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds()) + '</span>' + '<span class="msg-content">' + cont + '</span>';
        }
        return $sce.trustAsHtml(html);
    };

    $scope.login = function () {
        if (!$scope.data.username) {
            return;
        }
        var addr = $scope.data.addr || '127.0.0.1:2015';

        $scope.setting(addr.split(':')[0], parseInt(addr.split(':')[1]));
        $scope.connect();
    };

    $scope.submit = function () {
        if (!$scope.input) {
            return;
        }
        var data     = encodeURI($scope.input);
        var time     = (new Date()).getTime();
        $({
            type:    'msg',
            content: {
                name: $scope.data.username,
                time: time,
                data: data
            }
        });
        $scope.input = '';
    };

    $scope.keydown = function ($event) {
        if ($event.keyCode == 13) {
            $scope.submit();
            $event.preventDefault();
        }
    };

    $scope.addEmoji = function (em) {
        $scope.input += ' :' + em + ':';
    };

    $scope.addImage = function () {
        fileSelector.click();
    };

    // Set port and host
    $scope.setting = function (host, port) {
        ipc.send('synchronous-message', {
            name: 'setting',
            host: host,
            port: port
        });
    };

    // Connect to server
    $scope.connect = function () {
        ipc.send('synchronous-message', 'connect');
    };
}
