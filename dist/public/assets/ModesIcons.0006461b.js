import{d as e,L as s,o as a,b as l,f as o,G as i,n as t,l as n,F as m,e as c}from"./vendor.7edd7468.js";var d=e({name:"ModesIcons",props:{modes:{type:Array,required:!0},toggler:Boolean},emits:["toggle"]});const r={key:0,class:"fas fa-circle mode-margin"},u={key:1,class:"fas fa-drum mode-margin"},g={key:2,class:"fas fa-apple-alt mode-margin"},f={key:3,class:"fas fa-stream mode-margin"},k={key:4,class:"fas fa-check-double mode-margin"};d.render=function(e,d,h,p,y,v){const x=s("bs-tooltip");return e.toggler?(a(),l(m,{key:0},[o("a",{class:"mode-margin",href:"#",onClick:d[0]||(d[0]=n((s=>e.$emit("toggle","osu")),["prevent"]))},[i(o("i",{class:t(["fas fa-circle",e.modes.includes("osu")?"":"text-white-50"])},null,2),[[x,"toggle osu!"]])]),o("a",{class:"mode-margin",href:"#",onClick:d[1]||(d[1]=n((s=>e.$emit("toggle","taiko")),["prevent"]))},[i(o("i",{class:t(["fas fa-drum",e.modes.includes("taiko")?"":"text-white-50"])},null,2),[[x,"toggle osu!taiko"]])]),o("a",{class:"mode-margin",href:"#",onClick:d[2]||(d[2]=n((s=>e.$emit("toggle","catch")),["prevent"]))},[i(o("i",{class:t(["fas fa-apple-alt",e.modes.includes("catch")?"":"text-white-50"])},null,2),[[x,"toggle osu!catch"]])]),o("a",{class:"mode-margin",href:"#",onClick:d[3]||(d[3]=n((s=>e.$emit("toggle","mania")),["prevent"]))},[i(o("i",{class:t(["fas fa-stream",e.modes.includes("mania")?"":"text-white-50"])},null,2),[[x,"toggle osu!"]])])],64)):(a(),l(m,{key:1},[e.modes.includes("osu")?i((a(),l("i",r,null,512)),[[x,"osu!"]]):c("",!0),e.modes.includes("taiko")?i((a(),l("i",u,null,512)),[[x,"osu!taiko"]]):c("",!0),e.modes.includes("catch")?i((a(),l("i",g,null,512)),[[x,"osu!catch"]]):c("",!0),e.modes.includes("mania")?i((a(),l("i",f,null,512)),[[x,"osu!mania"]]):c("",!0),e.modes.includes("hybrid")?i((a(),l("i",k,null,512)),[[x,"multiple game modes"]]):c("",!0)],64))};export{d as _};
