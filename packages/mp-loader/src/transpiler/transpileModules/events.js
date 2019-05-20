const { normalizeMustache } = require('../helpers');

const EVENT_MAPPING = {
  tap: 'click'
};
const IS_EVENT_BINDING_REG = /{{(.*)}}/;

function transformNodeWrapper(listenerAction) {
  const EVENT_REG = new RegExp(`^${listenerAction}`);
  /**
   * transpile bindXxx to onXxxx
   * @param {*} node
   */
  return function(node) {
    const { attrsList } = node;
    if (!Array.isArray(attrsList)) {
      return;
    }
    const events = {};
    const toSplice = [];

    for (let i = 0, l = attrsList.length; i < l; i++) {
      let { name, value } = attrsList[i];
      if (EVENT_REG.test(name)) {
        let rawEvtName = name.slice(listenerAction.length);
        if (rawEvtName.length > 0 && listenerAction === 'on') {
          rawEvtName = rawEvtName[0].toLowerCase() + rawEvtName.slice(1);
        }

        const evtName = EVENT_MAPPING[rawEvtName] || rawEvtName;
        toSplice.push(i);

        // Gen handler
        if (IS_EVENT_BINDING_REG.test(value)) {
          value = `var fn = this[${normalizeMustache(value, node)}];`
           + 'fn && fn.call(this,$event);';
          events[evtName] = { value, disableAddThis: true, };
        /**
         * onTap="{{handlerName}}"
         * or
         * bindtap = "{{handlerName}}"
         * ->
         * {
         *   onClick: function($event){
         *     var fn = this[data.handlerName];
         *     fn && fn.call(this, $event);
         *   }.bind(this),
         * }
         */
        } else {
        /**
         * onTap="handler"
         * or
         * bindtap="handler"
         * ->
         * { onClick: this.handler }
         */
          events[evtName] = { value, scope: 'this.' };
        }
      }
    }

    toSplice.reverse().forEach(i => {
      splice(attrsList, i);
    });

    /**
   * If events not exists, not to generate event handlers.
   */
    if (Object.keys(events).length > 0) {
      node.events = events;
    }
  };
}

function splice(arr, i) {
  arr.splice(i, 1);
}

module.exports = {
  transformNodeWrapper
};
