class Issues {
    constructor() {
        this.issues = [];
    }

    addIssue(description, severity, assignedTo) {

        const issue = {
            id: chance.guid(chance.integer),
            description,
            severity,
            assignedTo,
            status: 'open'
        };

        this.issues.push(issue);
        this.storeIssues();

        return issue;
    }

    closeIssue = id => {
        this.issues.find(el => el.id === id).status = 'close';
        this.storeIssues();
    }

    deleteIssue = id => {
        const index = this.issues.findIndex(el => el.id === id);
        this.issues.splice(index, 1);
        this.storeIssues();
    }

    reopenIssue = id => {
        this.issues.find(el => el.id === id).status = 'open';
        this.storeIssues();
    }

    storeIssues() {
        localStorage.setItem('issue__list', JSON.stringify(this.issues));
    }

    readIssues() {
        const issuesList = JSON.parse(localStorage.getItem('issue__list'));

        if (issuesList) this.issues = issuesList;
    }

}

const state = {};

const elements = {
    submitBtn: '.issue-submit-btn',
    description: '#issue--desc',
    severity: '#issue--sev',
    assignedTo: '#issue--assign',
    issueList: '.issue--list',
    closeBtn: '.issue--close',
    deleteBtn: '.issue--delete'
};

var getFormInput = () => {
    return {
        description: document.querySelector(elements.description).value,
        assigned: document.querySelector(elements.assignedTo).value,
        sev: document.querySelector(elements.severity).value,
    }
}

const renderIssues = issue => {
    let sevStyle = 'severity';
    
    if (issue.severity === 'Low') {
        sevStyle += ' severity-low' ;
    } else if (issue.severity === 'Medium') {
        sevStyle += ' severity-medium' ;
    } else if (issue.severity === 'High') {
        sevStyle += ' severity-high' ;
    }
    

    markup = `
        <div class="issue--detail" data-issueid="${issue.id}">
            <p>Issue ID: <span>${issue.id}</span></p>
            <hr>
            <h6>${issue.description}</h6>
            <p><span class="fa fa-shield"></span><span class="${sevStyle}"> ${issue.severity}</span>   <span class="fa fa-user"></span> ${issue.assignedTo}</p>
            <hr>
            <a class="btn btn-${issue.status === 'close' ? 'info' : 'success'} btn-sm issue--${issue.status === 'close' ? 'reopen' : 'close'}">${issue.status === 'close' ? 'Reopen' : 'Close'}</a>
            <a class="btn btn-danger btn-sm issue--delete">Delete</a>
        </div>
    `;

    document.querySelector(elements.issueList).insertAdjacentHTML('afterbegin', markup);

}



const clearForm = () => {
    document.querySelector(elements.description).value = '';
    document.querySelector(elements.severity).selectedIndex = 0;
    document.querySelector(elements.assignedTo).value = '';
}

var issueController = () => {

    if (!state.issues) state.issues = new Issues();

    // 1. get the issue details from the input fields
    const formData = getFormInput();
    const newIssue = state.issues.addIssue(formData.description, formData.sev, formData.assigned);

    console.log(state.issues.issues);

    // 2. add new issue details to UI and clear UI
    renderIssues(newIssue);

    // 3. Clear the input fields
    clearForm();

};



var updateIssueUI = id => {
    const parent = document.querySelector(`[data-issueid="${id}"]`).children;

    for (var i = 0; i < parent.length; i++) {
        if (parent[i].classList.contains('issue--close')) {
            parent[i].classList.toggle('issue--close');
            parent[i].classList.toggle('issue--reopen');
            parent[i].classList.toggle('btn-success');
            parent[i].classList.toggle('btn-info');
            parent[i].textContent = 'Reopen'
            break;
        }
    }
};

var deleteIssueUI = id => {
    const element = document.querySelector(`[data-issueid="${id}"]`);
    element.parentElement.removeChild(element);
};


var closeIssue = id => {
    // update the status of the issue
    state.issues.closeIssue(id);

    // update the UI - hide close button and show reopen button
    updateIssueUI(id);
};

var reopenIssueUI = id => {
    const parent = document.querySelector(`[data-issueid="${id}"]`).children;

    for (var i = 0; i < parent.length; i++) {
        if (parent[i].classList.contains('issue--reopen')) {
            parent[i].classList.toggle('issue--close');
            parent[i].classList.toggle('issue--reopen');
            parent[i].classList.toggle('btn-success');
            parent[i].classList.toggle('btn-info');
            parent[i].textContent = 'Closes'
            break;
        }
    }
};

var deleteIssue = id => {
    // delete the issue
    state.issues.deleteIssue(id);

    // update the UI
    deleteIssueUI(id);
};

var reopenIssue = id => {
    // update the status of the issue
    state.issues.reopenIssue(id);

    // udpate the UI
    reopenIssueUI(id);
};


document.querySelector(elements.submitBtn).addEventListener('click', e => {
    e.preventDefault();
    issueController();
});

document.querySelector(elements.issueList).addEventListener('click', e => {

    // Get the id from the container
    const id = e.target.closest('.issue--detail').dataset.issueid;

    // close button clicked
    if (e.target.matches('.issue--close, .issue--close *')) {
        closeIssue(id);
    }
    // delete button clicked
    else if (e.target.matches('.issue--delete, .issue--delete *')) {
        deleteIssue(id);
    }
    // reopen button clicked
    else if (e.target.matches('.issue--reopen, .issue--reopen *')) {
        reopenIssue(id);
    }
});


window.addEventListener('load', () => {
    state.issues = new Issues();

    // restore issues
    state.issues.readIssues();

    // render the existing issues
    state.issues.issues.forEach(issue => renderIssues(issue));
});