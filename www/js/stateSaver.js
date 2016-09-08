// Class whose purpose is save scope states to preserve data on route structure
var StateSaver = (function () {
  var meta = {};
  var states = {};
  return {
    // add view state
    add: function (state) {
      states[state] = {};
      return this;
    },
    set: function (stateName, state) {
      if (stateName && state) {
        if (states[stateName]) {
          states[stateName] = state;
        }
        else {
          console.log("Created new state: " + stateName);
          states[stateName] = state;
        }
      }
      return this;
    },
    get: function (state) {
      if (state) return states[state];
      else return states;
    },
    //Save current state to data object, which puts into local storage
    save: function (state, data) {
      data.state = states[state];
      return this;
    },
    // Grabs old data previously save in local storage. If no data, return null
    apply: function (state, data) {
      if (Object.keys(states[state]).length === 0) return null;
      
      return states[state];
    }
  }
});
