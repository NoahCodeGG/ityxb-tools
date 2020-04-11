// ==UserScript==
// @name         传智播客刷课脚本
// @icon         http://stu.ityxb.com/favicon.ico
// @namespace    https://noahcode.cn
// @version      0.1
// @description  第一次写tampermonkey脚本，功能有待叠加，相关问题请联系我QQ：70082586
// @author       NoahCode
// @match        *://stu.ityxb.com/*
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';
    var url = location.pathname;
    var errorInfo = '请联系作者QQ：70082586，告知您的详细操作与报错'
    if (url.match('/preview/detail/')) {
        var previewId = url.replace(/\/preview\/detail\//i, '');
        console.log(previewId)
        var t = createT();
        GM_xmlhttpRequest({
            method: 'GET',
            url: 'http://stu.ityxb.com/back/bxg/preview/info?previewId=' + previewId + '&t=' + t,
            onload: function (data) {
                if (data.status === 200) {
                    var jsonObj = JSON.parse(data.response)
                    var chapters = jsonObj['resultObject']['chapters'];
                    var chapterNum = chapters.length;
                    for (var i = 0; i < chapterNum; i++) {
                        var points = chapters[i]['points'];
                        var pointNum = points.length;
                        for (var j = 0; j < pointNum; j++) {
                            var pointId = points[j]['point_id']
                            var videoDuration = points[j]['video_duration']
                            var isHaveQuestion = points[j]['is_have_question']
                            fuckInfo(previewId, pointId, videoDuration)
                            if (isHaveQuestion == true) {
                                dealProblems(previewId, pointId, t)
                            }
                        }
                    }
                } else {
                    console.log(errorInfo)
                }
            }
        });
    }

    function dealProblems(previewId, pointId, t) {
        GM_xmlhttpRequest({
            method: 'GET',
            url: 'http://stu.ityxb.com/back/bxg/preview/questions?previewId=' + previewId + '&pointId=' + pointId + '&t=' + t,
            onload: function (data) {
                if (data.status === 200) {
                    var jsonObj = JSON.parse(data.response)
                    var questions = jsonObj['resultObject'];
                    var questionNum = questions.length;
                    for (var i = 0; i < questionNum; i++) {
                        var questionId = questions[i]['id'];
                        fuckQuestions(previewId, pointId, questionId)
                    }
                } else {
                    console.log(errorInfo)
                }
            }
        });
    }

    function createT() {
        var str = '1585465';
        for (var i = 0; i < 6; i++) {
            str += Math.floor(Math.random() * 10);
        }
        return str;
    }

    function fuckInfo(previewId, pointId, watchedDuration) {
        GM_xmlhttpRequest({
            method: 'POST',
            url: 'http://stu.ityxb.com/back/bxg/preview/updateProgress',
            headers: {
                'Content-type': 'application/x-www-form-urlencoded'
            },
            data: 'previewId=' + previewId + '&pointId=' + pointId + '&watchedDuration=' + watchedDuration,
            onload: function (data) {
                if (data.status === 200) {
                    console.log('刷课成功')
                } else {
                    console.log(errorInfo)
                }
            }
        });
    }

    function fuckQuestions(previewId, pointId, preivewQuestionId) {
        GM_xmlhttpRequest({
            method: 'POST',
            url: 'http://stu.ityxb.com/back/bxg/preview/ansQuestions',
            headers: {
                'Content-type': 'application/x-www-form-urlencoded'
            },
            data: 'previewId=' + previewId + '&pointId=' + pointId + '&preivewQuestionId=' + preivewQuestionId + '&stuAnswer=' + 0,
            onload: function (data) {
                if (data.status === 200) {
                    console.log('刷题成功')
                } else {
                    console.log(errorInfo)
                }
            }
        });
    }
})();