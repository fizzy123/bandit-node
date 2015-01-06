var bandit = function(test) {
  "use strict";
  $.post('/bandit', {
    name: test.name,
    case: test.case
  });
};
