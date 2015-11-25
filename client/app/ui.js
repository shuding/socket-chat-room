/**
 * Created by shuding on 11/25/15.
 * <ds303077135@gmail.com>
 */

var app = angular.module('sc', ['ngAnimate']);

app.controller('main', ['$scope', '$sce', mainCtrl]);

function mainCtrl($scope, $sce) {
    $scope.state    = false;
    $scope.input    = '';
    $scope.msgList  = [];
    $scope.userList = {};
    $scope.isLogin  = false;
    $scope.data     = {
        username: '',
        emoji:    ['😂', '😀', '😆', '😘', '😶', '😥', '😪', '😝', '😓', '😷']
    };

    ipc.on('connect', function () {
        $scope.state = true;
        $scope.$apply();
    });
    ipc.on('error', function () {
        $scope.state = false;
        $scope.$apply();
    });
    ipc.on('end', function () {
        $scope.state = false;
        $scope.$apply();
    });
    ipc.on('push', function (data) {
        switch (data.content.type) {
            case 'syncuser':
                $scope.userList = data.content.data;
                $scope.$apply();
                break;
            case 'msg':
                $scope.msgList.push(data.content.data);
                $scope.$apply();
                console.log(data);
        }
    });

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
        $scope.input += em;
    };

    // Connect to server
    $scope.connect = function () {
        ipc.send('synchronous-message', 'connect');
    };

    $scope.connect();
}
