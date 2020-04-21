// ==UserScript==
// @name         传智播客刷课自动答题脚本
// @icon         http://stu.ityxb.com/favicon.ico
// @namespace    https://noahcode.cn
// @version      0.0.2
// @description  第一次写tampermonkey脚本，功能有待叠加，相关问题请联系我QQ：70082586，若是无法自动答题，很大几率是因为题库没有，题库数据很少还需要前人先做一遍然后自动录入到题库中
// @author       NoahCode
// @match        *://stu.ityxb.com/*
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';
    //设置修改后，需要刷新或重新打开网课页面才会生效
    var config = {
        commit_jianda : false //简单题是否使用题库数据（题库数据有可能会有问题）
    }
    var url = location.pathname;
    var errorInfo = '请联系作者QQ：70082586，告知您的详细操作与报错'
    var api = 'http://129.211.93.251:2955/'
    if (url.match('/preview/detail/')) {
        var previewId = url.replace(/\/preview\/detail\//i, '')
        var previewT = createPreviewT()
        GM_xmlhttpRequest({
            method: 'GET',
            url: 'http://stu.ityxb.com/back/bxg/preview/info?previewId=' + previewId + '&t=' + previewT,
            onload: function (data) {
                if (data.status === 200) {
                    var jsonObj = JSON.parse(data.response)
                    var chapters = jsonObj['resultObject']['chapters'];
                    var chapterNum = chapters.length;
                    var t = createPreviewT()
                    for (var i = 0; i < chapterNum; i++) {
                        var points = chapters[i]['points']
                        var pointNum = points.length
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
        })
    }
    else if (url.match('/lookPaper/busywork/')) {
        var re = /\/lookPaper\/busywork\/(.*?)\/[0-9]/i
        var lookPaperId = re.exec(url)[1]
        var lookPaperT = createLookPaperT()
        GM_xmlhttpRequest({
            method: 'GET',
            url: 'http://stu.ityxb.com/back/bxg/my/busywork/findStudentBusywork?busyworkId=' + lookPaperId + '&t=' + lookPaperT,
            onload: function (data) {
                if (data.status === 200) {
                    var jsonObj = JSON.parse(data.response)
                    var danxuanInfo = jsonObj['resultObject']['danxuan']
                    var danxuans = danxuanInfo['lists']
                    var danxuanNum = danxuanInfo['qNum']
                    if (danxuanInfo['studentTotalScore'] != 0) {
                        dealChooseQeustion('lookPaper', lookPaperId, '单选题', danxuans, danxuanNum)
                    }
                    var duoxuanInfo = jsonObj['resultObject']['duoxuan']
                    var duoxuans = duoxuanInfo['lists']
                    var duoxuanNum = duoxuanInfo['qNum']
                    if (duoxuanInfo['studentTotalScore'] != 0) {
                        dealChooseQeustion('lookPaper', lookPaperId, '多选题', duoxuans, duoxuanNum)
                    }
                    var panduanInfo = jsonObj['resultObject']['panduan']
                    var panduans = panduanInfo['lists']
                    var panduanNum = panduanInfo['qNum']
                    if (panduanInfo['studentTotalScore'] != 0) {
                        dealJudgeFillQeustion('lookPaper', lookPaperId, '判断题', panduans, panduanNum)
                    }
                    var tiankongInfo = jsonObj['resultObject']['tiankong']
                    var tiankongs = tiankongInfo['lists']
                    var tiankongNum = tiankongInfo['qNum']
                    dealJudgeFillQeustion('lookPaper', lookPaperId, '填空题', tiankongs, tiankongNum)
                    var jiandaInfo = jsonObj['resultObject']['jianda']
                    var jiandas = jiandaInfo['lists']
                    var jiandaNum = jiandaInfo['qNum']
                    dealJudgeFillQeustion('lookPaper', lookPaperId, '简答题', jiandas, jiandaNum)
                } else {
                    console.log(errorInfo)
                }
            }
        })
    }
    else if (url.match('/writePaper/busywork/')) {
        var reWritePaper = /\/writePaper\/busywork\/(.*?)courseId/i
        var writePaperId = url.replace(reWritePaper, '')
            .replace(/\/writePaper\/busywork\//i, '')
        GM_xmlhttpRequest({
            method: 'POST',
            url: 'http://stu.ityxb.com/back/bxg/my/busywork/startBusywork',
            headers: {
                'Content-type': 'application/x-www-form-urlencoded'
            },
            data: 'busyworkId=' + writePaperId,
            onload: function (data) {
                if (data.status === 200) {
                    var jsonObj = JSON.parse(data.response)
                    var danxuanInfo = jsonObj['resultObject']['danxuan']
                    var danxuans = danxuanInfo['lists']
                    var danxuanNum = danxuanInfo['qNum']
                    dealChooseQeustion('writePaper', writePaperId, '单选题', danxuans, danxuanNum)
                    var duoxuanInfo = jsonObj['resultObject']['duoxuan']
                    var duoxuans = duoxuanInfo['lists']
                    var duoxuanNum = duoxuanInfo['qNum']
                    dealChooseQeustion('writePaper', writePaperId, '多选题', duoxuans, duoxuanNum)
                    var panduanInfo = jsonObj['resultObject']['panduan']
                    var panduans = panduanInfo['lists']
                    var panduanNum = panduanInfo['qNum']
                    dealJudgeFillQeustion('writePaper', writePaperId, '判断题', panduans, panduanNum)
                    var tiankongInfo = jsonObj['resultObject']['tiankong']
                    var tiankongs = tiankongInfo['lists']
                    var tiankongNum = tiankongInfo['qNum']
                    dealJudgeFillQeustion('writePaper', writePaperId, '填空题', tiankongs, tiankongNum)
                    var jiandaInfo = jsonObj['resultObject']['jianda']
                    var jiandas = jiandaInfo['lists']
                    var jiandaNum = jiandaInfo['qNum']
                    dealJudgeFillQeustion('writePaper', writePaperId, '简答题', jiandas, jiandaNum)
                } else {
                    console.log(errorInfo)
                }
            }
        })
    }

    function dealChooseQeustion(judgeType, busyworkId, type, questions, questionNum) {
        for (var i = 0; i < questionNum; i++) {
            var sourceQuestion = questions[i]['questionContentText']
            var question = dealContentText(sourceQuestion)
            var questionOptionList = questions[i]['questionOptionList']
            var questionId = questions[i]['id']
            if (judgeType == 'lookPaper') {
                if (questions[i]['stuScore'] == questions[i]['score']) {
                    var answer = ''
                    for (var j = 0; j < questionOptionList.length; j++) {
                        if (questionOptionList[j]['isSelcted']) {
                            if (answer != '') {
                                answer += ';'
                            }
                            answer += dealOption(type, questionOptionList[j]['text'])
                        }
                    }
                    insertToDatabase(type, question, answer)
                }
            } else {
                for (var z = 0; z < questionOptionList.length; z++) {
                    var text = dealOption(type, questionOptionList[z]['text'])
                    console.log(text)
                    searchFromDatabase(busyworkId, questionId, type, question, text, z)
                }
            }
        }
    }

    function dealJudgeFillQeustion(judgeType, busyworkId, type, questions, questionNum) {
        for (var i = 0; i < questionNum; i++) {
            var sourceQuestion = questions[i]['questionContentText']
            var question = dealContentText(sourceQuestion)
            var questionId = questions[i]['id']
            var text = ''
            if (judgeType == 'lookPaper') {
                if (questions[i]['isAnswer'] == true) {
                    var answer = questions[i]['stuAnswer']
                    if (type == '判断题' || type == '简答题') {
                        insertToDatabase(type, question, answer)
                    } else {
                        var result = dealOption(type, answer)
                        insertToDatabase(type, question, result)
                    }
                }
            } else {
                searchFromDatabase(busyworkId, questionId, type, question, text, 0)
            }
        }
    }

    function searchFromDatabase(busyworkId, questionId, type, question, text, index) {
        GM_xmlhttpRequest({
            method: 'GET',
            url: api + 'search?type=' + type + '&question=' + question,
            onload: function (data) {
                if (data.status === 200) {
                    var jsonObj = JSON.parse(data.response)
                    var sourceAnswer = jsonObj['data'][0]['answer']
                    if (type == '单选题' || type == '多选题') {
                        if (sourceAnswer.search(';') != -1) {
                            var answers = sourceAnswer.split(';')
                            for (var n = 0; n < answers.length; n++) {
                                if (answers[n] == text) {
                                    console.log(questionId + ' ' + index)
                                    fuckHomeWork(busyworkId, questionId, index)
                                } else {
                                    console.log(text)
                                }
                            }
                        } else {
                            if (sourceAnswer == text) {
                                console.log(index)
                                fuckHomeWork(busyworkId, questionId, index)
                            }
                        }
                    } else if (type == '填空题') {
                        var startStr = '["'
                        var endStr = '"]'
                        var str = startStr + sourceAnswer + endStr
                        console.log(str)
                        fuckHomeWork(busyworkId, questionId, str)
                    } else if (type == '简答题' && config.commit_jianda) {
                        fuckHomeWork(busyworkId, questionId, sourceAnswer)
                    }
                    else {
                        fuckHomeWork(busyworkId, questionId, sourceAnswer)
                    }
                }
            }
        })
    }

    function insertToDatabase(type, question, answer) {
        GM_xmlhttpRequest({
            method: 'GET',
            url: api + 'add?type=' + type + '&question=' + question + '&answer=' + answer,
            onload: function (data) {
                if (data.status === 200) {
                    var jsonObj = JSON.parse(data.response)
                    console.log(jsonObj['message'])
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
                    var questions = jsonObj['resultObject']
                    var questionNum = questions.length
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

    function dealOption(type, str) {
        if (type == '填空题') {
            var reFist = /【(.*?)】/g
            var values = str.match(reFist)
            var reSecond = /【(.*)】/i
            var result = ''
            for (var i = 0; i < values.length; i++) {
                if (result != '') {
                    result += ';'
                }
                result += reSecond.exec(values[i])[1]
            }
            return String(result)
                .replace('&amp;', '&')
                .replace('&quot;', '"')
                .replace('&#39;', '\'')
                .replace('&lt;', '<')
                .replace('&gt;', '>')
                .replace('&quot;', '')
        } else {
            var re = /[A-Z]、(.*?)$/
            var srouceStr = re.exec(str)[1]
            return String(srouceStr)
                .replace('&amp;', '&')
                .replace('&quot;', '"')
                .replace('&#39;', '\'')
                .replace('&lt;', '<')
                .replace('&gt;', '>')
                .replace('&quot;', '')
        }
    }

    function dealContentText(str) {
        return String(str)
            .replace('（）', '')
            .replace('。', '')
            .replace(',', '')
            .replace('（  ）', '')
    }

    function createPreviewT() {
        var str = '1585465';
        for (var i = 0; i < 6; i++) {
            str += Math.floor(Math.random() * 10)
        }
        return str;
    }

    function createLookPaperT() {
        var str = '1587060';
        for (var i = 0; i < 6; i++) {
            str += Math.floor(Math.random() * 10)
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

    function fuckHomeWork(busyworkId, busyworkQuestionId, answer) {
        GM_xmlhttpRequest({
            method: 'POST',
            url: 'http://stu.ityxb.com/back/bxg/my/busywork/updateStudentAns',
            headers: {
                'Content-type': 'application/x-www-form-urlencoded'
            },
            data: 'busyworkId=' + busyworkId + '&busyworkQuestionId=' + busyworkQuestionId + '&answer=' + answer,
            onload: function (data) {
                if (data.status === 200) {
                    var jsonObj = JSON.parse(data.response)
                    console.log(jsonObj)
                } else {
                    console.log(errorInfo)
                }
            }
        });
    }
})()