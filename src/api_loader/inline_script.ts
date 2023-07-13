/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Query parameters for the script loading URL of the Maps JavaScript API.
 * See: https://developers.google.com/maps/documentation/javascript/url-params.
 */
declare interface BootstrapParams {
  key: string;
  v?: string;
  language?: string;
  region?: string;
  solutionChannel?: string;
  authReferrerPolicy?: string;
}

/**
 * Loads inline script for the Dynamic Library Import API. See:
 * https://developers.google.com/maps/documentation/javascript/dynamic-loading.
 */
function load(params: BootstrapParams): typeof google.maps {
  // @ts-ignore
  (g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=`https://maps.${c}apis.com/maps/api/js?`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})(params);
  return google.maps;
}

export default {load};
