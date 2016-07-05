# css-selector
---


## How to use.
---
		
 1. include this script or better to include min file (dist/lokesh_pushup.min.js). 
 2. call 
  
  ```javascript
   
   var disposeSelector = Selector.activateSelector()

    
  ```
  3. click on the page element. That's it. 

  4. If you want to stop seeing css-selectors on the page, you kill it.

  ```javascript

  disposeSelector(); //handler will be removed from the page.

  ```

  **InDepth**
  If you just want to use with other functions and control the output then you should use 
    `calculteCssSelector` function.

   

    
    If you want lib. to display `CSS-Selector` on the page but want to handle they when to call or 
    
    where to add, then use
    `displaySelector`

   

    
    Use `activateSelector`. If you don't want to control and want to use working model.
    you can disable it anytime. 

---

### Notes:
---

1. For more Read the codebase.
refer file `loeksh_pushup.js`

2. For production use file `dist/lokesh_pushup.min.js`.

3. `Selector.activateSelector()` will note work in IE<8. for more follow [link](http://caniuse.com/#feat=addeventlistener) and due to `Array.from` API.




