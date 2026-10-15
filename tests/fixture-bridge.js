'use strict';
window.chrome = parent.fixtureChrome;
window.requestAnimationFrame = () => 0;
Object.defineProperty(document, 'hasFocus', { value: () => parent.fixtureFocused });
Object.defineProperty(document, 'visibilityState', { get: () => parent.fixtureVisible ? 'visible' : 'hidden' });
window.LOCAL_CUSTOM_GROUPS = parent.fixtureGroups || [];

window.policyViolations = [];
document.addEventListener('securitypolicyviolation', event => window.policyViolations.push(event.violatedDirective));
