import{d as _,m as g,z as y,_ as v,o as t,e as o,a as s,j as h,t as l,k as r,F as u,r as p,b as k,v as w,s as b,u as f,X as M}from"./index-17fbe2b7.js";const C={namespaced:!0,state:{merch:[]},mutations:{setMerch(e,a){e.merch=a}},getters:{allMerch:e=>e.merch}},I=C,S=_({name:"MerchPage",data(){return{checkoutOutput:{},clicked:!1,worldCupSweaterSize:""}},computed:{...g(["loggedInUser"]),...y("merch",["allMerch"])},beforeCreate(){this.$store.hasModule("merch")||this.$store.registerModule("merch",I)},async created(){const e=await this.$http.initialRequest("/merch/query");this.$http.isError(e)||this.$store.commit("merch/setMerch",e.merch)},methods:{async checkout(e,a){this.clicked=!0;const n=await this.$http.executePost("/merch/checkout",{vid:e,size:this.worldCupSweaterSize},a);console.log(n),this.$http.isError(n)||(this.checkoutOutput=n,window.location.replace(n.webUrl))}}});const d=e=>(b("data-v-0c57c5d8"),e=e(),f(),e),U=d(()=>s("p",{class:"opacity-0"}," . ",-1)),$={key:0,class:"my-4"},z={key:0,class:"col-sm-12 card card-body ps-4"},L=M('<h5 class="mt-2" data-v-0c57c5d8> info </h5><div class="mb-2" data-v-0c57c5d8>all products listed here have a 100% discount. prices are still listed on the checkout page for tax/customs reasons. they are lower than retail prices.</div><div data-v-0c57c5d8>you can only begin the checkout process <b data-v-0c57c5d8>once</b>! this requires...</div><ul data-v-0c57c5d8><li data-v-0c57c5d8>contact email <span class="text-secondary small" data-v-0c57c5d8>(this must be the same as your osu! account&#39;s email)</span></li><li data-v-0c57c5d8>shipping address</li><li data-v-0c57c5d8>billing address <span class="text-secondary small" data-v-0c57c5d8>(can be the same as your shipping address)</span></li></ul><div data-v-0c57c5d8>when you&#39;ve gathered this info, checkout below :)</div>',5),X=[L],O={key:1,class:"double-center text-center"},V=d(()=>s("p",null,"request expired",-1)),q=d(()=>s("p",null,[h("if you think something went wrong, "),s("a",{href:"https://osu.ppy.sh/community/chat?sendto=3178418",target:"_blank"},"talk to pishifat")],-1)),N=[V,q],P={key:2},B=d(()=>s("hr",null,null,-1)),D={key:0},E={key:1},A={class:"card card-body my-2 ps-4"},F=d(()=>s("div",null," based on your world cup placement(s), you'll receive these prizes: ",-1)),T={key:0,class:"text-secondary small"},j={key:0},G=d(()=>s("span",{class:"small text-secondary"},"(instead of the extra sweater above^)",-1)),R={key:1},H=d(()=>s("li",null,"world cup sticker",-1)),J={key:2},K=d(()=>s("option",{disabled:"",value:""}," Select a size ",-1)),Q=["disabled"],W=d(()=>s("option",{value:"M"}," Medium ",-1)),Y=d(()=>s("option",{value:"L"}," Large ",-1)),Z=d(()=>s("option",{value:"XL"}," XL ",-1)),x=["disabled"],ee=d(()=>s("option",{value:"3XL"}," 3xL ",-1)),se=["disabled"],te={key:2},oe={class:"text-lowercase"},ce={class:"d-inline"},de=["src"],ae={class:"small text-secondary"},ie=["onClick"],le={key:0},re=d(()=>s("p",{class:"opacity-0"}," . ",-1)),ne={key:1,class:"double-center"};function he(e,a,n,ue,pe,me){return t(),o("div",null,[U,e.clicked?(t(),o("div",ne," redirecting to shopify checkout... ")):(t(),o("div",$,[e.loggedInUser.hasMerchAccess?(t(),o("div",z,X)):(t(),o("div",O,N)),e.loggedInUser.hasMerchAccess?(t(),o("div",P,[B,e.loggedInUser.hasSpecificMerchOrder?(t(),o("div",D,[s("button",{class:"btn btn-sm btn-outline-info mt-2 d-grid gap-2 col-12 mx-auto",onClick:a[0]||(a[0]=c=>e.checkout(null,c))}," your order has already been selected! proceed to checkout ")])):e.loggedInUser.worldCupMerch.active?(t(),o("div",E,[s("div",A,[F,s("ul",null,[s("li",null,[h(l(e.loggedInUser.worldCupMerch.sweater)+" world cup sweater ",1),e.loggedInUser.worldCupMerch.additionalItems?(t(),o("span",T,"(for shipping reasons, we can only send one sweater)")):r("",!0)]),e.loggedInUser.worldCupMerch.additionalItems?(t(),o("li",j,[h(l(e.loggedInUser.worldCupMerch.additionalItems)+" additional item(s) ",1),G])):r("",!0),e.loggedInUser.worldCupMerch.pin?(t(),o("li",R,"world cup pin")):r("",!0),H,e.loggedInUser.worldCupMerch.coins.length?(t(),o("span",J,[(t(!0),o(u,null,p(e.loggedInUser.worldCupMerch.coins,c=>(t(),o("li",{key:c},l(c)+" challenge coin",1))),128))])):r("",!0)]),h(" choose a sweater size: "),k(s("select",{"onUpdate:modelValue":a[1]||(a[1]=c=>e.worldCupSweaterSize=c),class:"form-select form-select-sm mb-2"},[K,s("option",{disabled:e.loggedInUser.worldCupMerch.sweater==2023,value:"S"}," Small ",8,Q),W,Y,Z,s("option",{disabled:e.loggedInUser.worldCupMerch.sweater==2023,value:"2XL"}," 2XL ",8,x),ee],512),[[w,e.worldCupSweaterSize]]),s("button",{class:"btn btn-sm btn-outline-info mt-2 d-grid gap-2 col-12 mx-auto",disabled:!e.worldCupSweaterSize,onClick:a[2]||(a[2]=c=>e.checkout(null,c))}," proceed to shopify checkout ",8,se)])])):(t(),o("div",te,[(t(!0),o(u,null,p(e.allMerch,c=>(t(),o("div",{key:c.id,class:"card card-level-2 card-body my-2 ps-4"},[s("h4",oe,l(c.title),1),s("div",ce,[(t(!0),o(u,null,p(c.images,i=>(t(),o("img",{key:i.id,src:i.src,class:"merch-img me-2 mb-2"},null,8,de))),128))]),s("div",ae,l(c.description),1),(t(!0),o(u,null,p(c.variants,i=>(t(),o("div",{key:i.id},[s("button",{class:"btn btn-sm btn-outline-info mt-2 d-grid gap-2 col-12 mx-auto",onClick:m=>e.checkout(i.id,m)},[h(" proceed to shopify checkout "),i.title!=="Default Title"?(t(),o("span",le,"("+l(i.selectedOptions[0].name)+": "+l(i.selectedOptions[0].value)+")",1)):r("",!0)],8,ie)]))),128))]))),128))])),re])):r("",!0)]))])}const ge=v(S,[["render",he],["__scopeId","data-v-0c57c5d8"]]);export{ge as default};
