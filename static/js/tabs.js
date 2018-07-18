function initializeTabs(element) {
  function childElements(element) {
    return [].slice.call(element.childNodes)
      .filter(function(el) {
        return el.nodeType === 1;
      });
  }

  childElements(element.querySelector('.tabs-body'))
    .forEach(function(node, i) {
      node.id = i;
    });

  M.Tabs.init(element.querySelector('.tabs'));
}
