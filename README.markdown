#bayesian-bandit.js
Use mongoose to save test cases

#Quick Start
In node.js:

    npm install bandit-node

Serverside:

    var bandit = require('bandit-node');
    ...
    bandit.routes(app);

### bandit.test(test-name, testCaseArr, callback)
Estblishes the test if a test with test-name exists and returns which case is appropriate



In the browser:

    <script src="https://raw.github.com/joinspoton/bandit-node/master/client/bandit.client.js"></script>

### bandit(case_name)
Does get request to server to recieve which case was successful
