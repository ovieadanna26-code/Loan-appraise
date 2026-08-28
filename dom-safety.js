/* DOM safety guard for legacy enhancement scripts. Prevents stale insertBefore references from breaking login/UI initialization. */
(function(){
  if(window.__loanAppraiseDomSafetyInstalled) return;
  window.__loanAppraiseDomSafetyInstalled=true;
  const nativeInsertBefore=Node.prototype.insertBefore;
  Node.prototype.insertBefore=function(newNode,referenceNode){
    if(referenceNode && referenceNode.parentNode !== this){
      return this.appendChild(newNode);
    }
    return nativeInsertBefore.call(this,newNode,referenceNode);
  };
})();
