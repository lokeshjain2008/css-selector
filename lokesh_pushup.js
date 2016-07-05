/**
 * CSS Selector
 *--------------------
 * How to use.
 * 1. include this script or better to include min file (dist/lokesh_pushup.min.js). 
 * 2. call 
 *  
 *  ```javascript
 *   
 *   var disposeSelector = Selector.activateSelector()
 *
 *    
 *  ```
 *  3. click on the page element. That's it. 
 *
 *  4. If you want to stop seeing css-selectors on the page, you kill it.
 *
 *  ```javascript
 *
 *  disposeSelector(); //handler will be removed from the page.
 *
 *  ```
 */


var Selector = (function(window, document) {
  'use strict';
  var Lib = {};

  //Helper Functions keeping them private to avoid name collision.
  function _createClassListArray(node) {
    //classList doesn't return Array.
    //ClassList is actually DOMTokenList
    // Array.from will create a array out DOMTokenList.

    return Array.from(node.classList);

  }

  function _idSelector(id) {
    return "#" + id;
  }

  function _getLocation(el) {
    el = el.getBoundingClientRect();
    return {
      left: el.left + window.scrollX,
      top: el.top + window.scrollY
    };
  }

  /**
   * Creating style 'string' from the object
   * containing the rules.
   * Inputs: (styleObject:<object>)
   */

  function _prepareStyleFromObject(styleObject) {
    var styleKeys = Object.keys(styleObject);
    return styleKeys.map(function(key) {
      return key + ':' + styleObject[key]+';' ;
    }).reduce(function(acc, value) {
      return acc + value;
    }, '');
  }

  /**
   * Public API
   * Inputs : (node:<HtmlElement>),
   * Output: (cssSelector:<string>)
   * 
   */


  Lib.caluculateCssSelector = function caluculateCssSelector(node) {
    var steps = [],
      step = null,
      contextNode = node;
    //Iterate over the node and its parents till the selector is optimized 
    //Each node will get its own selector via `_cssPathStep`.  
    while (contextNode) {
      step = Lib._cssPathStep(contextNode, contextNode === node);
      steps.push(step);
      if (step.optimized) {
        break;
      }
      contextNode = contextNode.parentNode;
    }
    //Selector create are in bottom to top. Reversing is need to correct the ordeer.
    steps.reverse();
    return steps.join(" > ");
  }


  /**
   * Public API
   * Use to create create css selector popup.
   * You can use this function in your event handlers
   */


  Lib.displaySelector = function displaySelector(node) {
    var cssSelector = Lib.caluculateCssSelector(node)||'Bad happened!',
      displayFragment = document.createDocumentFragment(),
      style = {},
      readyStyle= '';

    var el = document.createElement('div');
    el.innerText = cssSelector;
    style.top = _getLocation(node).top + 'px';
    style.left = _getLocation(node).left + 'px';
    style.position = 'absolute';
    style['z-index'] = '1000';
    style['border-radius'] = '3px';
    style['margin-top'] =  '-22px';
    style.padding =  '5px 10px';
    style.color = 'white';
    style.background = 'rgba(0,0,0,0.6)';
    style['box-shadow'] = '1px 1px  0px 2px rgba(200,100,100,0.3)';
    readyStyle = _prepareStyleFromObject(style);
    el.setAttribute('style', readyStyle);
    displayFragment.appendChild(el);
    document.body.appendChild(displayFragment);
  }

  Lib.activateSelector = function activateSelector(eventType) {
    var body = document.body;
    var evType = eventType || 'click';

    var handler = function handler(event){
      Lib.displaySelector(event.target);
    }

    body.addEventListener(evType, handler, false);
    //disposing the handler

    return function(){
      body.removeEventListener(evType, handler);
    };
  }


  /**
   * Private API
   * Calculates css for the node passed into.
   * Inputs: (node:<HTMLElement>, isTargetNode)
   * Output: (css-Selector: <string>)
   */

  Lib._cssPathStep = function _cssPathStep(node, isTargetNode) {

    var id = node.getAttribute("id"),
      parent = node.parentNode,
      nodeName = node.nodeName.toLowerCase(),
      result = '';

    if (id) {
      //If we get the ID of the node
      //we won the battle.
      return new Lib.DOMNodePathStep(_idSelector(id), true);
    }
    parent = node.parentNode;

    if (nodeName === "body" || nodeName === "html") {
      //We have reached the super parents lets call it off.
      return new Lib.DOMNodePathStep(node.nodeName.toLowerCase(), true);
    }

    if (!parent){
      // We don't parent element to go Deep now. Call it off.
      return new Lib.DOMNodePathStep(nodeName.toLowerCase(), true);
    }
    // If don't hit the end point grab the its cssPath.  
    result = Lib._createClassPath(node, isTargetNode);
    return new Lib.DOMNodePathStep(result, false);
  };


  /**
   * Private API
   * 
   */

  Lib._createClassPath = function _createClassPath(node, isTargetNode) {

    var OwnClassNamesArray = _createClassListArray(node),
      nodeName = node.nodeName.toLowerCase(),
      needsClassNames = false,
      needsNthChild = false,
      ownIndex = -1,
      i = 0,
      parent = node.parentNode;

    var siblings = parent.children;

    /**
     * node can have some sibling Elements
     * Case 'No sibling'
     * then nodeName
     * case 'siblings'
     *   case 'All classes are same'
     *    then nth:child 
     *    case 'classes are different'
     *    then classes are sufficinent. 
     */


    for (i = 0; (ownIndex === -1 || !needsNthChild) && i < siblings.length; ++i) {
      var sibling = siblings[i];
      if (sibling === node) {
        ownIndex = i;
        continue;
      }
      if (needsNthChild) {
        continue;
      }
      if (sibling.nodeName.toLowerCase() !== nodeName) {
        continue;
      }

      needsClassNames = true;
      var ownClassNames = OwnClassNamesArray;
      if (ownClassNames.length === 0) {
        needsNthChild = true;
        continue;
      }
      var siblingClassNamesArray = _createClassListArray(sibling);

      siblingClassNamesArray.forEach(function(cls, index) {
        var indexOfClassOfNoode = ownClassNames.indexOf(cls);
        if (indexOfClassOfNoode !== -1) {
          delete ownClassNames[indexOfClassOfNoode]; // will create undefined in the array
        }
      });
      //remove all the undefined using filter
      //If there no element left means we need child selector
      if (!ownClassNames.filter(Boolean).length) {
        needsNthChild = true;
      }
    }

    var result = nodeName;
    if (isTargetNode && nodeName === "input" && node.getAttribute("type")
      && !node.getAttribute("id") && !node.getAttribute("class"))
      result += "[type=\"" + node.getAttribute("type") + "\"]";
    if (needsNthChild) {
      result += ":nth-child(" + (ownIndex + 1) + ")";
    } else if (needsClassNames) {
      result += OwnClassNamesArray.map(function(name) { return '.' + name }).join('');
    }

    return result;
  };


  /**
   * Constructor for pathStep
   * Inputs:(value:<string>, optimized:<boolean>)
   */

  Lib.DOMNodePathStep = function DOMNodePathStep(value, optimized) {
    this.value = value;
    this.optimized = optimized || false;
  }

  Lib.DOMNodePathStep.prototype = {
    toString: function() {
      return this.value;
    }
  }

  /**
   * Revealing module pattern to minimize the footprint of the module.
   * calculateCssSelector will output <string> css selector needed.
   *
   * How to use 
   * If you just want to use with other functions and control the output then you should use 
   * `calculteCssSelector` function.
   *
   * If you want lib. to display `CSS-Selector` on the page but want to handle they when to call or 
   * where to add, then use
   * `displaySelector`
   *
   * Use `activateSelector`. If you don't want to control and want to use working model.
   * you can disable it anytime. 
   * 
   */
  return {
    getSelector: Lib.caluculateCssSelector,
    displaySelector: Lib.displaySelector,
    activateSelector: Lib.activateSelector
  };


})(window, document);





