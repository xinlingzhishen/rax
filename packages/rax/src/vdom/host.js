/*
 * Stateful things in runtime
 */
export default {
  mountID: 1,
  component: null,
  isRendering: false,
  dirtyComponents: [],
  // Roots
  rootComponents: {},
  rootInstances: {},
  // Inject
  hook: null,
  driver: null,
  monitor: null,
};
