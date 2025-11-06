import{j as r}from"./app-DVTrhL1p.js";import{c as n}from"./createLucideIcon-CpnvUODs.js";import{T as d}from"./trash-oH1G05Hf.js";/**
 * @license lucide-react v0.552.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const s=[["path",{d:"M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",key:"1m0v6g"}],["path",{d:"M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",key:"ohrbg2"}]],u=n("square-pen",s);function g({onDelete:e,onEdit:t,otherButton:o,isDeleteShown:a=!0}){return r.jsxs("div",{className:"inline-flex rounded-lg shadow-md",role:"group",children:[r.jsx("button",{title:"Edit",type:"button",onClick:t,className:`
                    p-2 text-sm font-medium transition-all duration-200
                    text-gray-700 dark:text-gray-300
                    bg-white dark:bg-gray-800
                    border border-gray-200 dark:border-gray-700
                    rounded-l-lg
                    
                    /* Hover/Focus States */
                    hover:bg-gray-50 dark:hover:bg-gray-700 
                    hover:text-blue-600 dark:hover:text-blue-400
                    focus:z-10 focus:ring-1 focus:ring-blue-500 focus:text-blue-600 dark:focus:text-blue-400
                `,children:r.jsx(u,{className:"w-4 h-4"})}),a&&r.jsx("button",{title:"Delete",type:"button",onClick:e,className:`
                            p-2 text-sm font-medium transition-all duration-200
                            text-gray-700 dark:text-gray-300
                            bg-white dark:bg-gray-800
                            /* Border separates from Edit button */
                            border-y border-r border-gray-200 dark:border-gray-700
                            rounded-r-lg
                            
                            /* Hover/Focus States - Clear Red for Danger */
                            hover:bg-red-50 dark:hover:bg-red-900 
                            hover:text-red-600 dark:hover:text-red-400
                            focus:z-10 focus:ring-1 focus:ring-red-500 focus:text-red-600 dark:focus:text-red-400
                        `,children:r.jsx(d,{className:"w-4 h-4"})}),o]})}export{g as A};
