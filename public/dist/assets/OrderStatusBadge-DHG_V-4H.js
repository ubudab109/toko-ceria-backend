import{j as a}from"./app-DVTrhL1p.js";import{c as e}from"./createLucideIcon-CpnvUODs.js";import{P as i}from"./package-BG6wzjzp.js";/**
 * @license lucide-react v0.552.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]],x=e("circle-check-big",k);/**
 * @license lucide-react v0.552.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]],y=e("circle-x",g);/**
 * @license lucide-react v0.552.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const s=[["rect",{width:"20",height:"14",x:"2",y:"5",rx:"2",key:"ynyp8z"}],["line",{x1:"2",x2:"22",y1:"10",y2:"10",key:"1b3vmo"}]],p=e("credit-card",s);/**
 * @license lucide-react v0.552.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=[["line",{x1:"10",x2:"14",y1:"2",y2:"2",key:"14vaq8"}],["line",{x1:"12",x2:"15",y1:"14",y2:"11",key:"17fdiu"}],["circle",{cx:"12",cy:"14",r:"8",key:"1e1u0o"}]],h=e("timer",b);/**
 * @license lucide-react v0.552.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=[["path",{d:"M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978",key:"1n3hpd"}],["path",{d:"M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978",key:"rfe1zi"}],["path",{d:"M18 9h1.5a1 1 0 0 0 0-5H18",key:"7xy6bh"}],["path",{d:"M4 22h16",key:"57wxv0"}],["path",{d:"M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z",key:"1mhfuq"}],["path",{d:"M6 9H4.5a1 1 0 0 1 0-5H6",key:"tex48p"}]],u=e("trophy",m);/**
 * @license lucide-react v0.552.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _=[["path",{d:"M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2",key:"wrbu53"}],["path",{d:"M15 18H9",key:"1lyqi6"}],["path",{d:"M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14",key:"lysw3i"}],["circle",{cx:"17",cy:"18",r:"2",key:"332jqn"}],["circle",{cx:"7",cy:"18",r:"2",key:"19iecd"}]],f=e("truck",_),v={pending:{icon:h,color:{text:"text-yellow-800",bg:"bg-yellow-100",darkText:"dark:text-yellow-200",darkBg:"dark:bg-yellow-900"},label:"Pending"},process_payment:{icon:p,color:{text:"text-indigo-800",bg:"bg-indigo-100",darkText:"dark:text-indigo-200",darkBg:"dark:bg-indigo-900"},label:"Processing Payment"},paid:{icon:x,color:{text:"text-blue-800",bg:"bg-blue-100",darkText:"dark:text-blue-200",darkBg:"dark:bg-blue-900"},label:"Paid"},cancelled:{icon:y,color:{text:"text-red-800",bg:"bg-red-100",darkText:"dark:text-red-200",darkBg:"dark:bg-red-900"},label:"Cancelled"},on_delivery:{icon:f,color:{text:"text-orange-800",bg:"bg-orange-100",darkText:"dark:text-orange-200",darkBg:"dark:bg-orange-900"},label:"On Delivery"},delivered:{icon:i,color:{text:"text-green-800",bg:"bg-green-100",darkText:"dark:text-green-200",darkBg:"dark:bg-green-900"},label:"Delivered"},completed:{icon:u,color:{text:"text-purple-800",bg:"bg-purple-100",darkText:"dark:text-purple-200",darkBg:"dark:bg-purple-900"},label:"Completed"}},$=({status:o,className:c})=>{const r=v[o];if(!r)return null;const{icon:d,color:t,label:n}=r,l=`
    inline-flex items-center 
    px-3 py-0.5 rounded-full text-xs sm:text-sm font-medium 
    ${t.text} ${t.bg} ${t.darkText} ${t.darkBg}
    whitespace-nowrap
  `;return a.jsxs("span",{className:`${l} ${c}`,children:[a.jsx(d,{className:"w-3 h-3 mr-1.5","aria-hidden":"true"}),n]})};export{$ as O};
