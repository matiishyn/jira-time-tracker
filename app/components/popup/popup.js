var jtt = {

    configs: {
        lsValueTitle: 'jttData',
        // SELECTORS
        issuesUl: 'issues',
        startWorkingForm: 'startWorkingForm',
        issueIdInput: 'issueId',
        currentIssues: 'currentIssues',
        stopWorkBtns: 'stop-work-on-issue',
        clearAllIssues: 'clearAllIssues'
    },

    // STORE FOR DATA
    data: {
        issues: [
            {
                id: 'OAPI-1234',
                startTs: 1,
                endTs: 2
            }
        ],
        currentIssue: {}

    },

    // WORKING WITH SAVING AND LOADING DATA
    saveData: function () {
        localStorage[this.configs.lsValueTitle] = JSON.stringify(this.data);
    },
    loadData: function () {
        var lsItem = localStorage[this.configs.lsValueTitle];
        this.data = lsItem ? JSON.parse(localStorage[this.configs.lsValueTitle]) : {};
    },

    /**
     * RENDERING
     */
    // RENDER LIST OF ISSUES
    renderIssuesList: function () {
        var issuesUl = this.byId(this.configs.issuesUl),
            lis = document.createDocumentFragment(),
            issuesArr = this.data.issues || [];
        issuesArr.forEach(function (issueObj) {
            var li = document.createElement("li"),
                spentTime = (issueObj.endTs - issueObj.startTs) / 60000,
                spentTime = spentTime.toFixed(2),
                spentTxt = issueObj.endTs ? ' - Spent <kbd>' + spentTime + '</kbd> mins' : '. In Progress';
            li.innerHTML = '<b>' + issueObj.id + '</b>' + spentTxt;
            li.className = 'list-group-item';
            lis.appendChild(li);
        });
        issuesUl.innerHTML = '';
        issuesUl.appendChild(lis);
    },

    // RENDER CURRENT ISSUE
    renderCurrentIssue: function () {
        var issuesUl = this.byId(this.configs.currentIssues),
            issueObj = this.data.currentIssue || {},
            lis = document.createDocumentFragment(),
            li = document.createElement("div");

        if(this.data.currentIssue.id) {
            li.className = 'list-group-item';
            li.innerHTML = '<a href="#" >' +
            issueObj.id + '</a><button data-issue-id="' +
            issueObj.id + '" class="btn btn-warning btn-xs pull-right stop-work-on-issue">Stop</button>';
            issuesUl.innerHTML = '';
            lis.appendChild(li);

            issuesUl.appendChild(lis);

        } else {
            issuesUl.innerHTML = '';
        }

    },


    getCurrentTabUrl: function (callback) {
        var queryInfo = {
            active: true,
            currentWindow: true
        };
        chrome.tabs.query(queryInfo, function (tabs) {
            var tab = tabs[0];
            var url = tab.url;
            console.assert(typeof url == 'string', 'tab.url should be a string');
            callback(url);
        });
    },

    onLoaded: function () {
        var that = this;
        this.loadData();

        this.getCurrentTabUrl(function (url) {
            if (url && url.match(/jira/gi)) {
                // then url from jira
                var id = url ? url.slice(url.lastIndexOf('/') + 1) : '';
                that.byId(that.configs.issueIdInput).value = id;
            }
        });
        this.renderIssuesList();
        this.renderCurrentIssue();

        this.byId(this.configs.startWorkingForm).addEventListener('submit', this.startWorkingOnIssue.bind(this));
        this.byId(this.configs.currentIssues).addEventListener('click', this.clickOnCurrentIssue.bind(this));
        this.byId(this.configs.clearAllIssues).addEventListener('click', this.clearAllIssues.bind(this));
    },

    startWorkingOnIssue: function (e) {
        e.preventDefault();
        var issueIdInput = this.byId(this.configs.issueIdInput),
        // add to array
            issue = {
                id: issueIdInput.value,
                startTs: this.getTimestamp(),
                endTs: null
            };
        this.data.currentIssue = issue;

        // render Current Issue section
        this.renderCurrentIssue();

        // clear field
        issueIdInput.value = '';

        // save data
        this.saveData();
    },

    stopWorkingOnCurrentIssue: function () {
        // set end timestamp
        this.data.currentIssue.endTs = this.getTimestamp();

        // add to issue list
        this.data.issues = this.data.issues || [];
        this.data.issues.push(this.data.currentIssue);
        this.renderIssuesList();

        // clear current issue
        this.data.currentIssue = {};
        this.renderCurrentIssue();

        // save data
        this.saveData();
    },

    clearAllIssues: function () {
        this.data.issues = [];
        this.saveData();
        this.renderIssuesList();
    },

    clickOnCurrentIssue: function (e) {
        //debugger;
        e.preventDefault();
        // event delegation
        if (e.target && e.target.className.indexOf('stop-work-on-issue') !== -1) {
            this.stopWorkingOnCurrentIssue();
        }
    },

    init: function () {
        document.addEventListener('DOMContentLoaded', this.onLoaded.bind(this));
    },

    /**
     * HELPERS
     */
    byId: function (idStr) {
        return document.getElementById(idStr);
    },
    byClass: function (idStr) {
        return document.getElementsByClassName(idStr);
    },

    getTimestamp: function () {
        return new Date().getTime();
    }
};

jtt.init();
