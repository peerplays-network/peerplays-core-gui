function get(state) {
  return key => state[key] || '';
}

function set(state) {
  return (key, value) => {
    state[key] = value;
    return this;
  };
}

export {get, set};
