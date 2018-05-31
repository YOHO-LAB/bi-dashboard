export default {
  getterProductInfo(state) {
    return (pid) => {
      const project = state.projectCaches[pid];

      if (project) {
        return project;
      }
      return {};
    };
  }
};
