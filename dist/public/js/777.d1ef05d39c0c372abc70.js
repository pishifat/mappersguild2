(self.webpackChunkmappersguild=self.webpackChunkmappersguild||[]).push([[777],{1787:(e,t,s)=>{"use strict";var o,a;s.d(t,{U:()=>o,O:()=>a}),function(e){e.WIP="WIP",e.Done="Done",e.Qualified="Qualified",e.Ranked="Ranked",e.Secret="Secret"}(o||(o={})),function(e){e.Osu="osu",e.Taiko="taiko",e.Catch="catch",e.Mania="mania",e.Hybrid="hybrid"}(a||(a={}))},8691:(e,t,s)=>{"use strict";s.d(t,{Z:()=>f});var o=s(5393);const a={class:"container"},i={class:"row"},n=(0,o.createVNode)("option",{value:"user"}," User ",-1),r=(0,o.createVNode)("option",{value:"admin"}," Admin ",-1),c=(0,o.createVNode)("option",{value:"secret"}," Secret ",-1),d=(0,o.createVNode)("option",{value:"spectator"}," Spectator ",-1),u={class:"row"},l={class:"row"};var p=s(1516),m=function(e,t,s,o){return new(s||(s=Promise))((function(a,i){function n(e){try{c(o.next(e))}catch(e){i(e)}}function r(e){try{c(o.throw(e))}catch(e){i(e)}}function c(e){var t;e.done?a(e.value):(t=e.value,t instanceof s?t:new s((function(e){e(t)}))).then(n,r)}c((o=o.apply(e,t||[])).next())}))};const h=(0,o.defineComponent)({name:"UserInfo",components:{ModalDialog:p.Z},props:{user:{type:Object,default:null}},data:()=>({badge:0,discordId:"",group:""}),watch:{user(){this.badge=this.user.badge||0,this.discordId=this.user.discordId||"",this.group=this.user.group||""}},created(){this.user&&(this.badge=this.user.badge||0,this.discordId=this.user.discordId||"",this.group=this.user.group||"")},methods:{updateGroup(e){return m(this,void 0,void 0,(function*(){const t=yield this.$http.executePost(`/admin/users/${this.user.id}/updateGroup`,{group:this.group},e);t&&(this.$store.dispatch("updateToastMessages",{message:`set group to ${t}`,type:"info"}),this.$store.commit("updateGroup",{userId:this.user.id,group:t}))}))},updateBadge(e){return m(this,void 0,void 0,(function*(){const t=yield this.$http.executePost(`/admin/users/${this.user.id}/updateBadge`,{badge:this.badge},e);t&&(this.$store.dispatch("updateToastMessages",{message:`set badge to ${t}`,type:"info"}),this.$store.commit("updateBadge",{userId:this.user.id,badge:t}))}))},updateDiscordId(e){return m(this,void 0,void 0,(function*(){const t=yield this.$http.executePost(`/admin/users/${this.user.id}/updateDiscordId`,{discordId:this.discordId},e);t&&(this.$store.dispatch("updateToastMessages",{message:`set discord ID to ${t}`,type:"info"}),this.$store.commit("updateDiscordId",{userId:this.user.id,discordId:t}))}))},calculateUserPoints(e){return m(this,void 0,void 0,(function*(){const t=yield this.$http.executePost(`/admin/users/${this.user.id}/calculateUserPoints`,{},e);t&&this.$store.dispatch("updateToastMessages",{message:`calculated points: ${t}`,type:"info"})}))},toggleBypassLogin(e){return m(this,void 0,void 0,(function*(){const t=yield this.$http.executePost(`/admin/users/${this.user.id}/toggleBypassLogin`,{bypassLogin:!this.user.bypassLogin},e);t&&(this.$store.dispatch("updateToastMessages",{message:`set bypassLogin to ${t.bypassLogin}`,type:"info"}),this.$store.commit("updateBypassLogin",{userId:this.user.id,group:t.group,bypassLogin:t.bypassLogin}))}))}}});h.render=function(e,t,s,p,m,h){const f=(0,o.resolveComponent)("user-link"),g=(0,o.resolveComponent)("modal-dialog");return(0,o.openBlock)(),(0,o.createBlock)(g,{id:"editUser","header-class":e.user?"bg-rank-"+e.user.rank:"",loaded:Boolean(e.user)},{header:(0,o.withCtx)((()=>[(0,o.createVNode)(f,{user:e.user},null,8,["user"])])),default:(0,o.withCtx)((()=>[(0,o.createVNode)("div",a,[(0,o.createVNode)("p",i,[(0,o.withDirectives)((0,o.createVNode)("select",{"onUpdate:modelValue":t[1]||(t[1]=t=>e.group=t),class:"form-select form-select-sm w-50 mx-2"},[n,r,c,d],512),[[o.vModelSelect,e.group]]),(0,o.createVNode)("button",{class:"btn btn-sm btn-outline-info w-25",onClick:t[2]||(t[2]=t=>e.updateGroup(t))}," Save group ")]),(0,o.createVNode)("p",u,[(0,o.withDirectives)((0,o.createVNode)("input",{"onUpdate:modelValue":t[3]||(t[3]=t=>e.badge=t),class:"form-control form-control-sm mx-2 w-50",type:"text",autocomplete:"off"},null,512),[[o.vModelText,e.badge]]),(0,o.createVNode)("button",{class:"btn btn-sm btn-outline-info w-25",onClick:t[4]||(t[4]=t=>e.updateBadge(t))}," Save badge ")]),(0,o.createVNode)("p",l,[(0,o.withDirectives)((0,o.createVNode)("input",{"onUpdate:modelValue":t[5]||(t[5]=t=>e.discordId=t),class:"form-control form-control-sm mx-2 w-50",type:"text",autocomplete:"off"},null,512),[[o.vModelText,e.discordId]]),(0,o.createVNode)("button",{class:"btn btn-sm btn-outline-info w-25",onClick:t[6]||(t[6]=t=>e.updateDiscordId(t))}," Save Discord ID ")]),(0,o.createVNode)("p",null,[(0,o.createVNode)("button",{class:"btn btn-sm btn-outline-info w-100",onClick:t[7]||(t[7]=t=>e.calculateUserPoints(t))}," Calculate user points ")]),(0,o.createVNode)("p",null,[(0,o.createVNode)("button",{class:"btn btn-sm btn-outline-info w-100",onClick:t[8]||(t[8]=t=>e.toggleBypassLogin(t))},(0,o.toDisplayString)(e.user.bypassLogin?"Enable":"Disable")+" ranked maps login requirement ",1)])])])),_:1},8,["header-class","loaded"])};const f=h},5607:(e,t,s)=>{"use strict";s.d(t,{Z:()=>p});var o=s(5393);const a={class:"card card-body container"},i=(0,o.createVNode)("h5",null," Associated maps ",-1),n={key:0,class:"ps-3 mb-0 list-unstyled"},r={key:1},c=(0,o.createTextVNode)(" by "),d={key:1,class:"small text-white-50 ms-3"};var u=s(1787);const l=(0,o.defineComponent)({props:{associatedMaps:{type:Array,required:!0}},methods:{findIcon:e=>e==u.U.WIP?"fa-ellipsis-h":e==u.U.Done?"fa-check":e==u.U.Qualified||e==u.U.Ranked?"fa-check-circle":""}});l.render=function(e,t,s,u,l,p){const m=(0,o.resolveComponent)("user-link"),h=(0,o.resolveDirective)("bs-tooltip");return(0,o.openBlock)(),(0,o.createBlock)("div",a,[i,e.associatedMaps.length?((0,o.openBlock)(),(0,o.createBlock)("ul",n,[((0,o.openBlock)(!0),(0,o.createBlock)(o.Fragment,null,(0,o.renderList)(e.associatedMaps,(t=>((0,o.openBlock)(),(0,o.createBlock)("li",{key:t.id,class:"text-secondary"},[(0,o.withDirectives)((0,o.createVNode)("i",{class:["fas me-1",[`text-${t.status.toLowerCase()}`,e.findIcon(t.status)]]},null,2),[[h,t.status]]),t.url?((0,o.openBlock)(),(0,o.createBlock)("a",{key:0,href:t.url,target:"_blank"},(0,o.toDisplayString)(t.song.artist)+" - "+(0,o.toDisplayString)(t.song.title),9,["href"])):((0,o.openBlock)(),(0,o.createBlock)("span",r,(0,o.toDisplayString)(t.song.artist)+" - "+(0,o.toDisplayString)(t.song.title),1)),c,(0,o.createVNode)(m,{user:t.host},null,8,["user"])])))),128))])):((0,o.openBlock)(),(0,o.createBlock)("div",d," No associated maps... "))])};const p=l},3669:(e,t,s)=>{"use strict";s.r(t),s.d(t,{default:()=>pt});var o=s(5393);const a={class:"container card card-body py-1 mb-4"},i={class:"row mx-3 mt-2"},n={class:"row"},r={class:"col"},c={class:"ms-4 mt-2"},d=(0,o.createVNode)("a",{href:"#actionBeatmaps","data-bs-toggle":"collapse"},[(0,o.createTextVNode)(" Beatmaps "),(0,o.createVNode)("i",{class:"fas fa-angle-down"})],-1),u={key:0,class:"ms-2 small text-white-50"},l={id:"actionBeatmaps",class:"show"},p={key:0,class:"table table-sm"},m=(0,o.createVNode)("thead",null,[(0,o.createVNode)("tr",null,[(0,o.createVNode)("th",{scope:"col"}," METADATA "),(0,o.createVNode)("th",{scope:"col"}," PACK ID "),(0,o.createVNode)("th",{scope:"col"}," STATUS "),(0,o.createVNode)("th",{scope:"col"}," EDIT ")])],-1),h={scope:"row"},f={key:1,class:"ms-1"},g={scope:"row"},y={scope:"row"},k={scope:"row"},v={key:1,class:"text-white-50 ms-5"},N={class:"container card card-body py-1 mb-4"},V={class:"row mx-3 mt-2"},b={class:"row"},w={class:"col"},I={class:"ms-4 mt-2"},B=(0,o.createVNode)("a",{href:"#actionQuests","data-bs-toggle":"collapse"},[(0,o.createTextVNode)(" Quests "),(0,o.createVNode)("i",{class:"fas fa-angle-down"})],-1),q={key:0,class:"ms-2 small text-white-50"},x={id:"actionQuests",class:"show"},$={key:0,class:"table table-sm"},M=(0,o.createVNode)("thead",null,[(0,o.createVNode)("tr",null,[(0,o.createVNode)("th",{scope:"col"}," NAME "),(0,o.createVNode)("th",{scope:"col"}," CREATOR "),(0,o.createVNode)("th",{scope:"col"}," MODES "),(0,o.createVNode)("th",{scope:"col"}," STATUS "),(0,o.createVNode)("th",{scope:"col"}," MAPSETS "),(0,o.createVNode)("th",{scope:"col"}," EDIT ")])],-1),P={scope:"row"},C={scope:"row"},D={scope:"row"},S={scope:"row"},U={scope:"row"},Q={scope:"row"},T={key:1,class:"text-white-50 ms-5"},A={class:"container card card-body py-1"},L={class:"row mx-3 mt-2"},R={key:0,class:"ms-2 small text-white-50"},E={class:"row"},j={class:"col"},O={class:"ms-4 mt-2"},F=(0,o.createVNode)("a",{href:"#actionUsers","data-bs-toggle":"collapse"},[(0,o.createTextVNode)(" Users "),(0,o.createVNode)("i",{class:"fas fa-angle-down"})],-1),G={key:0,class:"ms-2 small text-white-50"},Z={key:0,id:"actionUsers",class:"show"},z={key:0,class:"table table-sm"},_=(0,o.createVNode)("thead",null,[(0,o.createVNode)("tr",null,[(0,o.createVNode)("th",{scope:"col"}," USERNAME "),(0,o.createVNode)("th",{scope:"col"}," RANK "),(0,o.createVNode)("th",{scope:"col"}," BADGE "),(0,o.createVNode)("th",{scope:"col"}," EDIT ")])],-1),W={scope:"row"},K={scope:"row"},H={scope:"row"},J={key:1,class:"text-white-50 ms-5"},X=(0,o.createVNode)("div",{class:"radial-divisor"},null,-1);var Y=s(6564),ee=s(3330),te=s(4653);const se=(0,o.withScopeId)("data-v-78676411");(0,o.pushScopeId)("data-v-78676411");const oe={class:"container"},ae={class:"small text-white-50"},ie=(0,o.createTextVNode)(" Artist "),ne=(0,o.createVNode)("i",{class:"fas fa-edit"},null,-1),re={key:0},ce={key:1,class:"ms-2"},de={key:2,class:"ms-2"},ue={class:"small text-white-50"},le=(0,o.createTextVNode)(" Name "),pe=(0,o.createVNode)("i",{class:"fas fa-edit"},null,-1),me={key:3},he={key:4,class:"ms-2"},fe={class:"small text-white-50"},ge=(0,o.createTextVNode)(" Objective "),ye=(0,o.createVNode)("i",{class:"fas fa-edit"},null,-1),ke={key:5},ve={key:6,class:"ms-2"},Ne={class:"small text-white-50"},Ve=(0,o.createTextVNode)(" Required mapsets "),be=(0,o.createVNode)("i",{class:"fas fa-edit"},null,-1),we={key:7},Ie={key:8,class:"ms-2"},Be={class:"small text-white-50"},qe=(0,o.createTextVNode)(" Price "),xe=(0,o.createVNode)("i",{class:"fas fa-edit"},null,-1),$e={key:9},Me={key:10,class:"ms-2"},Pe={class:"small text-white-50"},Ce=(0,o.createTextVNode)(" Timeframe "),De=(0,o.createVNode)("i",{class:"fas fa-edit"},null,-1),Se={key:11},Ue={key:12,class:"ms-2"},Qe={class:"small text-white-50"},Te=(0,o.createTextVNode)(" Party size "),Ae=(0,o.createVNode)("i",{class:"fas fa-edit"},null,-1),Le={key:13},Re={key:14,class:"ms-2"},Ee=(0,o.createVNode)("div",{class:"small text-white-50"}," Party rank ",-1),je={class:"ms-2"},Oe=(0,o.createVNode)("div",{class:"small text-white-50"}," MBC ",-1),Fe={class:"ms-2"},Ge=(0,o.createVNode)("div",{class:"radial-divisor"},null,-1),Ze=(0,o.createVNode)("button",{class:"btn btn-outline-secondary w-100","data-bs-toggle":"collapse","data-bs-target":"#forumPm"},[(0,o.createTextVNode)(" See rejection message "),(0,o.createVNode)("i",{class:"fas fa-angle-down"})],-1),ze={id:"forumPm",class:"collapse"},_e=(0,o.createVNode)("div",null,"hello, you're receiving this message because you submitted a Mappers' Guild quest for review",-1),We=(0,o.createVNode)("div",null,"[box=your quest info]",-1),Ke=(0,o.createVNode)("div",null,"[/box]",-1),He=(0,o.createVNode)("div",null,"your quest has been rejected for the following reason(s):",-1),Je=(0,o.createVNode)("div",null,"[notice] REASONS [/notice]",-1),Xe=(0,o.createVNode)("div",null,"points spent for submitting the quest have been returned to your \"available points\" pool. if you'd like to modify the quest according to above feedback, you can resubmit it and i'll review it again! or if you'd like to submit any other quest, that's fine too!",-1),Ye=(0,o.createVNode)("div",null,"thanks for being cool",-1);(0,o.popScopeId)();const et=se(((e,t,s,a,i,n)=>{const r=(0,o.resolveComponent)("user-link"),c=(0,o.resolveComponent)("copy-paste"),d=(0,o.resolveComponent)("modal-dialog");return(0,o.openBlock)(),(0,o.createBlock)(d,{id:"reviewQuest",loaded:Boolean(e.quest)},{header:se((()=>[(0,o.createTextVNode)((0,o.toDisplayString)(e.quest.name)+" by ",1),(0,o.createVNode)(r,{class:"text-dark",user:e.quest.creator},null,8,["user"])])),default:se((()=>[(0,o.createVNode)("div",oe,[(0,o.createVNode)("div",ae,[ie,(0,o.createVNode)("a",{href:"#",onClick:t[1]||(t[1]=(0,o.withModifiers)((t=>e.showArtistInput=!e.showArtistInput),["prevent"]))},[ne])]),e.showArtistInput?((0,o.openBlock)(),(0,o.createBlock)("p",re,[(0,o.withDirectives)((0,o.createVNode)("input",{"onUpdate:modelValue":t[2]||(t[2]=t=>e.artistInput=t),class:"form-control form-control-sm w-100",type:"number",autocomplete:"off",placeholder:"artist ID...",onChange:t[3]||(t[3]=t=>e.updateArt(t))},null,544),[[o.vModelText,e.artistInput,void 0,{number:!0}]])])):e.quest.art?((0,o.openBlock)(),(0,o.createBlock)("p",ce,[(0,o.createVNode)("a",{href:"https://osu.ppy.sh/beatmaps/artists/"+e.quest.art,target:"_blank"},[(0,o.createVNode)("img",{src:"https://assets.ppy.sh/artists/"+e.quest.art+"/cover.jpg",class:"card-avatar-img"},null,8,["src"])],8,["href"])])):((0,o.openBlock)(),(0,o.createBlock)("p",de," None ")),(0,o.createVNode)("div",ue,[le,(0,o.createVNode)("a",{href:"#",onClick:t[4]||(t[4]=(0,o.withModifiers)((t=>e.showNameInput=!e.showNameInput),["prevent"]))},[pe])]),e.showNameInput?((0,o.openBlock)(),(0,o.createBlock)("p",me,[(0,o.withDirectives)((0,o.createVNode)("input",{"onUpdate:modelValue":t[5]||(t[5]=t=>e.nameInput=t),class:"form-control form-control-sm w-100",type:"text",autocomplete:"off",placeholder:"name...",onChange:t[6]||(t[6]=t=>e.renameQuest(t))},null,544),[[o.vModelText,e.nameInput]])])):((0,o.openBlock)(),(0,o.createBlock)("p",he,(0,o.toDisplayString)(e.quest.name),1)),(0,o.createVNode)("div",fe,[ge,(0,o.createVNode)("a",{href:"#",onClick:t[7]||(t[7]=(0,o.withModifiers)((t=>e.showObjectiveInput=!e.showObjectiveInput),["prevent"]))},[ye])]),e.showObjectiveInput?((0,o.openBlock)(),(0,o.createBlock)("p",ke,[(0,o.withDirectives)((0,o.createVNode)("textarea",{"onUpdate:modelValue":t[8]||(t[8]=t=>e.objectiveInput=t),class:"form-control form-control-sm w-100",rows:"2",type:"text",autocomplete:"off",placeholder:"objective...",onChange:t[9]||(t[9]=t=>e.updateDescription(t))},null,544),[[o.vModelText,e.objectiveInput]])])):((0,o.openBlock)(),(0,o.createBlock)("p",ve,(0,o.toDisplayString)(e.quest.descriptionMain),1)),(0,o.createVNode)("div",Ne,[Ve,(0,o.createVNode)("a",{href:"#",onClick:t[10]||(t[10]=(0,o.withModifiers)((t=>e.showRequiredMapsetsInput=!e.showRequiredMapsetsInput),["prevent"]))},[be])]),e.showRequiredMapsetsInput?((0,o.openBlock)(),(0,o.createBlock)("p",we,[(0,o.withDirectives)((0,o.createVNode)("input",{"onUpdate:modelValue":t[11]||(t[11]=t=>e.requiredMapsetsInput=t),class:"form-control form-control-sm w-100",type:"number",autocomplete:"off",placeholder:"required mapsets...",onChange:t[12]||(t[12]=t=>e.updateRequiredMapsets(t))},null,544),[[o.vModelText,e.requiredMapsetsInput,void 0,{number:!0}]])])):((0,o.openBlock)(),(0,o.createBlock)("p",Ie,(0,o.toDisplayString)(e.quest.requiredMapsets),1)),(0,o.createVNode)("div",Be,[qe,(0,o.createVNode)("a",{href:"#",onClick:t[13]||(t[13]=(0,o.withModifiers)((t=>e.showPriceInput=!e.showPriceInput),["prevent"]))},[xe])]),e.showPriceInput?((0,o.openBlock)(),(0,o.createBlock)("p",$e,[(0,o.withDirectives)((0,o.createVNode)("input",{"onUpdate:modelValue":t[14]||(t[14]=t=>e.priceInput=t),class:"form-control form-control-sm w-100",type:"number",autocomplete:"off",placeholder:"price per party member...",onChange:t[15]||(t[15]=t=>e.updatePrice(t))},null,544),[[o.vModelText,e.priceInput,void 0,{number:!0}]])])):((0,o.openBlock)(),(0,o.createBlock)("p",Me,(0,o.toDisplayString)(e.quest.price)+" points per user ",1)),(0,o.createVNode)("div",Pe,[Ce,(0,o.createVNode)("a",{href:"#",onClick:t[16]||(t[16]=(0,o.withModifiers)((t=>e.showTimeframeInput=!e.showTimeframeInput),["prevent"]))},[De])]),e.showTimeframeInput?((0,o.openBlock)(),(0,o.createBlock)("p",Se,[(0,o.withDirectives)((0,o.createVNode)("input",{"onUpdate:modelValue":t[17]||(t[17]=t=>e.timeframeInput=t),class:"form-control form-control-sm w-100",type:"number",autocomplete:"off",placeholder:"days...",onChange:t[18]||(t[18]=t=>e.updateTimeframe(t))},null,544),[[o.vModelText,e.timeframeInput,void 0,{number:!0}]])])):((0,o.openBlock)(),(0,o.createBlock)("p",Ue,(0,o.toDisplayString)(e.quest.timeframe/864e5)+" days ",1)),(0,o.createVNode)("div",Qe,[Te,(0,o.createVNode)("a",{href:"#",onClick:t[19]||(t[19]=(0,o.withModifiers)((t=>e.showPartySizeInput=!e.showPartySizeInput),["prevent"]))},[Ae])]),e.showPartySizeInput?((0,o.openBlock)(),(0,o.createBlock)("p",Le,[(0,o.withDirectives)((0,o.createVNode)("input",{"onUpdate:modelValue":t[20]||(t[20]=t=>e.minPartyInput=t),class:"form-control form-control-sm w-100",type:"number",autocomplete:"off",placeholder:"minimum",onChange:t[21]||(t[21]=t=>e.updateMinParty(t))},null,544),[[o.vModelText,e.minPartyInput,void 0,{number:!0}]]),(0,o.withDirectives)((0,o.createVNode)("input",{"onUpdate:modelValue":t[22]||(t[22]=t=>e.maxPartyInput=t),class:"form-control form-control-sm w-100",type:"number",autocomplete:"off",placeholder:"maximum",onChange:t[23]||(t[23]=t=>e.updateMaxParty(t))},null,544),[[o.vModelText,e.maxPartyInput,void 0,{number:!0}]])])):((0,o.openBlock)(),(0,o.createBlock)("p",Re,(0,o.toDisplayString)(e.quest.minParty)+"-"+(0,o.toDisplayString)(e.quest.maxParty)+" members ",1)),Ee,(0,o.createVNode)("p",je,(0,o.toDisplayString)(e.quest.minRank)+" rank required ",1),Oe,(0,o.createVNode)("p",Fe,(0,o.toDisplayString)(e.quest.isMbc?"yes":"no"),1),Ge,(0,o.createVNode)("button",{type:"submit",class:"btn btn-outline-success w-100",onClick:t[24]||(t[24]=t=>e.acceptPendingQuest(t))}," Schedule quest "),(0,o.createVNode)("button",{type:"submit",class:"btn btn-outline-danger w-100",onClick:t[25]||(t[25]=t=>e.rejectPendingQuest(t))}," Reject quest "),Ze,(0,o.createVNode)("div",ze,[(0,o.createVNode)(c,null,{default:se((()=>[_e,We,(0,o.createVNode)("div",null,"Artist: "+(0,o.toDisplayString)("https://osu.ppy.sh/beatmaps/artists/"+e.quest.art),1),(0,o.createVNode)("div",null,"Name: "+(0,o.toDisplayString)(e.quest.name),1),(0,o.createVNode)("div",null,"Objective: "+(0,o.toDisplayString)(e.quest.descriptionMain),1),(0,o.createVNode)("div",null,"Required mapsets: "+(0,o.toDisplayString)(e.quest.requiredMapsets),1),(0,o.createVNode)("div",null,"Price: "+(0,o.toDisplayString)(e.quest.price)+" points per user",1),(0,o.createVNode)("div",null,"Timeframe: "+(0,o.toDisplayString)(e.quest.timeframe/864e5)+" days",1),(0,o.createVNode)("div",null,"Party size: "+(0,o.toDisplayString)(e.quest.minParty)+"-"+(0,o.toDisplayString)(e.quest.maxParty)+" members",1),Ke,He,Je,Xe,Ye])),_:1})])])])),_:1},8,["loaded"])}));var tt=s(1516),st=s(285),ot=function(e,t,s,o){return new(s||(s=Promise))((function(a,i){function n(e){try{c(o.next(e))}catch(e){i(e)}}function r(e){try{c(o.throw(e))}catch(e){i(e)}}function c(e){var t;e.done?a(e.value):(t=e.value,t instanceof s?t:new s((function(e){e(t)}))).then(n,r)}c((o=o.apply(e,t||[])).next())}))};const at=(0,o.defineComponent)({name:"ReviewQuest",components:{CopyPaste:st.Z,ModalDialog:tt.Z},props:{quest:{type:Object,required:!0}},data(){return{showArtistInput:!1,artistInput:this.quest.art,showNameInput:!1,nameInput:this.quest.name,showObjectiveInput:!1,objectiveInput:this.quest.descriptionMain,showRequiredMapsetsInput:!1,requiredMapsetsInput:this.quest.requiredMapsets,showPriceInput:!1,priceInput:this.quest.price,showTimeframeInput:!1,timeframeInput:this.quest.timeframe/864e5,showPartySizeInput:!1,minPartyInput:this.quest.minParty,maxPartyInput:this.quest.maxParty}},watch:{quest(){this.showArtistInput=!1,this.artistInput=this.quest.art,this.showNameInput=!1,this.nameInput=this.quest.name,this.showObjectiveInput=!1,this.objectiveInput=this.quest.descriptionMain,this.showRequiredMapsetsInput=!1,this.requiredMapsetsInput=this.quest.requiredMapsets,this.showPriceInput=!1,this.priceInput=this.quest.price,this.showTimeframeInput=!1,this.timeframeInput=this.quest.timeframe/864e5}},methods:{acceptPendingQuest(e){return ot(this,void 0,void 0,(function*(){const t=yield this.$http.executePost(`/admin/quests/${this.quest.id}/schedule`,{},e);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:"scheduled quest",type:"info"}),this.$store.commit("updateStatus",{questId:this.quest.id,status:t}),this.$bs.hideModal("reviewQuest"))}))},rejectPendingQuest(e){return ot(this,void 0,void 0,(function*(){const t=yield this.$http.executePost(`/admin/quests/${this.quest.id}/reject`,{},e);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:"rejected quest",type:"info"}),this.$store.commit("updateStatus",{questId:this.quest.id,status:t}),this.$bs.hideModal("reviewQuest"))}))},updateArt(e){return ot(this,void 0,void 0,(function*(){const t=yield this.$http.executePost(`/admin/quests/${this.quest.id}/updateArt`,{art:this.artistInput},e);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:"updated artist",type:"info"}),this.$store.commit("updateArt",{questId:this.quest.id,art:t}),this.showArtistInput=!1)}))},renameQuest(e){return ot(this,void 0,void 0,(function*(){const t=yield this.$http.executePost(`/admin/quests/${this.quest.id}/rename`,{name:this.nameInput},e);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:"renamed quest",type:"info"}),this.$store.commit("renameQuest",{questId:this.quest.id,name:t}),this.showNameInput=!1)}))},updateDescription(e){return ot(this,void 0,void 0,(function*(){const t=yield this.$http.executePost(`/admin/quests/${this.quest.id}/updateDescription/`,{description:this.objectiveInput},e);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:"updated quest description",type:"info"}),this.$store.commit("updateDescription",{questId:this.quest.id,description:t}),this.showObjectiveInput=!1)}))},updateRequiredMapsets(e){return ot(this,void 0,void 0,(function*(){const t=yield this.$http.executePost(`/admin/quests/${this.quest.id}/updateRequiredMapsets`,{requiredMapsets:this.requiredMapsetsInput},e);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:"updated required mapsets",type:"info"}),this.$store.commit("updateRequiredMapsets",{questId:this.quest.id,requiredMapsets:t}),this.showRequiredMapsetsInput=!1)}))},updatePrice(e){return ot(this,void 0,void 0,(function*(){const t=yield this.$http.executePost(`/admin/quests/${this.quest.id}/updatePrice`,{price:this.priceInput},e);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:"updated price",type:"info"}),this.$store.commit("updatePrice",{questId:this.quest.id,price:t}),this.showPriceInput=!1)}))},updateTimeframe(e){return ot(this,void 0,void 0,(function*(){const t=yield this.$http.executePost(`/admin/quests/${this.quest.id}/updateTimeframe`,{timeframe:this.timeframeInput},e);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:"updated timeframe",type:"info"}),this.$store.commit("updateTimeframe",{questId:this.quest.id,timeframe:t}),this.showTimeframeInput=!1)}))},updateMinParty(e){return ot(this,void 0,void 0,(function*(){const t=yield this.$http.executePost(`/admin/quests/${this.quest.id}/updateMinParty`,{minParty:this.minPartyInput},e);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:"updated minParty",type:"info"}),this.$store.commit("updateMinParty",{questId:this.quest.id,minParty:t}),this.showPartySizeInput=!1)}))},updateMaxParty(e){return ot(this,void 0,void 0,(function*(){const t=yield this.$http.executePost(`/admin/quests/${this.quest.id}/updateMaxParty`,{maxParty:this.maxPartyInput},e);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:"updated maxParty",type:"info"}),this.$store.commit("updateMaxParty",{questId:this.quest.id,maxParty:t}),this.showPartySizeInput=!1)}))}}});at.render=et,at.__scopeId="data-v-78676411";const it=at;var nt=s(8691),rt=s(1787);const ct={state:{actionBeatmaps:[],actionBeatmapsLoading:!1,actionQuests:[],actionQuestsLoading:!1,actionUsers:[],actionUsersLoading:!1,selectedBeatmap:null,selectedQuest:null,selectedUser:null},mutations:{setActionBeatmaps(e,t){e.actionBeatmaps=t},setActionBeatmapsLoading(e,t){e.actionBeatmapsLoading=t},setActionQuests(e,t){e.actionQuests=t},setActionQuestsLoading(e,t){e.actionQuestsLoading=t},setActionUsers(e,t){e.actionUsers=t},setActionUsersLoading(e,t){e.actionUsersLoading=t},setSelectedBeatmap(e,t){e.selectedBeatmap=t},setSelectedQuest(e,t){e.selectedQuest=t},setSelectedUser(e,t){e.selectedUser=t},updateBeatmapStatus(e,t){const s=e.actionBeatmaps.find((e=>e.id==t.beatmapId));if(s&&(s.status=t.status,s.status==rt.U.Ranked)){const s=e.actionBeatmaps.findIndex((e=>e.id===t.beatmapId));e.actionBeatmaps.splice(s,1)}},deleteTask(e,t){const s=e.actionBeatmaps.find((e=>e.id==t.beatmapId));if(s){const e=s.tasks.findIndex((e=>e.id==t.taskId));-1!==e&&s.tasks.splice(e,1)}},deleteModder(e,t){const s=e.actionBeatmaps.find((e=>e.id==t.beatmapId));if(s){const e=s.modders.findIndex((e=>e.id==t.modderId));-1!==e&&s.modders.splice(e,1)}},updateUrl(e,t){const s=e.actionBeatmaps.find((e=>e.id==t.beatmapId));s&&(s.url=t.url)},updateStoryboardQuality(e,t){const s=e.actionBeatmaps.find((e=>e.id==t.beatmapId));if(s){const e=s.tasks.findIndex((e=>e.id==t.taskId));-1!==e&&(s.tasks[e]=t.task)}},updatePackId(e,t){const s=e.actionBeatmaps.find((e=>e.id==t.beatmapId));s&&(s.packId=t.packId)},updateIsShowcase(e,t){const s=e.actionBeatmaps.find((e=>e.id==t.beatmapId));s&&(s.isShowcase=t.isShowcase)},updateQueuedForRank(e,t){const s=e.actionBeatmaps.find((e=>e.id==t.beatmapId));s&&(s.queuedForRank=t.queuedForRank)},updateArt(e,t){const s=e.actionQuests.find((e=>e.id==t.questId));s&&(s.art=t.art)},renameQuest(e,t){const s=e.actionQuests.find((e=>e.id==t.questId));s&&(s.name=t.name)},updateDescription(e,t){const s=e.actionQuests.find((e=>e.id==t.questId));s&&(s.descriptionMain=t.description)},updateRequiredMapsets(e,t){const s=e.actionQuests.find((e=>e.id==t.questId));s&&(s.requiredMapsets=t.requiredMapsets)},updatePrice(e,t){const s=e.actionQuests.find((e=>e.id==t.questId));s&&(s.price=t.price)},updateTimeframe(e,t){const s=e.actionQuests.find((e=>e.id==t.questId));s&&(s.timeframe=864e5*t.timeframe)},updateMinParty(e,t){const s=e.actionQuests.find((e=>e.id==t.questId));s&&(s.minParty=t.minParty)},updateMaxParty(e,t){const s=e.actionQuests.find((e=>e.id==t.questId));s&&(s.maxParty=t.maxParty)},updateStatus(e,t){const s=e.actionQuests.find((e=>e.id==t.questId));if(s&&(s.status=t.status,"open"==s.status||"rejected"==s.status)){const s=e.actionQuests.findIndex((e=>e.id===t.questId));e.actionQuests.splice(s,1)}},updateQueuedForCompletion(e,t){const s=e.actionQuests.find((e=>e.id==t.questId));s&&(console.log(t.queuedForCompletion),s.queuedForCompletion=t.queuedForCompletion)},updateGroup(e,t){const s=e.actionUsers.find((e=>e.id==t.userId));s&&(s.group=t.group)},updateBadge(e,t){const s=e.actionUsers.find((e=>e.id==t.userId));if(s&&(s.badge=t.badge,s.badge==s.rank)){const s=e.actionUsers.findIndex((e=>e.id===t.userId));e.actionUsers.splice(s,1)}},updateDiscordId(e,t){const s=e.actionUsers.find((e=>e.id==t.userId));s&&(s.discordId=t.discordId)},updateBypassLogin(e,t){const s=e.actionUsers.find((e=>e.id==t.userId));s&&(s.bypassLogin=t.bypassLogin)}}};var dt=s(8834),ut=function(e,t,s,o){return new(s||(s=Promise))((function(a,i){function n(e){try{c(o.next(e))}catch(e){i(e)}}function r(e){try{c(o.throw(e))}catch(e){i(e)}}function c(e){var t;e.done?a(e.value):(t=e.value,t instanceof s?t:new s((function(e){e(t)}))).then(n,r)}c((o=o.apply(e,t||[])).next())}))};const lt=(0,o.defineComponent)({name:"AdminPage",components:{BeatmapInfoAdmin:ee.Z,QuestInfo:te.Z,ReviewQuest:it,UserInfo:nt.Z,ModesIcons:dt.Z},data:()=>({calculatingPoints:!1}),computed:(0,Y.rn)({actionBeatmaps:e=>e.admin.actionBeatmaps,actionBeatmapsLoading:e=>e.admin.actionBeatmapsLoading,actionQuests:e=>e.admin.actionQuests,actionQuestsLoading:e=>e.admin.actionQuestsLoading,actionUsers:e=>e.admin.actionUsers,actionUsersLoading:e=>e.admin.actionUsersLoading,selectedBeatmap:e=>e.admin.selectedBeatmap,selectedQuest:e=>e.admin.selectedQuest,selectedUser:e=>e.admin.selectedUser}),beforeCreate(){this.$store.hasModule("admin")||this.$store.registerModule("admin",ct)},unmounted(){this.$store.hasModule("admin")&&this.$store.unregisterModule("admin")},methods:{generateMetadata(e){let t=e.artist+" - ";return e.title.length>40?t+=e.title.slice(0,40)+"...":t+=e.title,t},loadActionBeatmaps(e){return ut(this,void 0,void 0,(function*(){{this.$store.commit("setActionBeatmaps",[]),this.$store.commit("setActionBeatmapsLoading",!0);const t=yield this.$http.executeGet("/admin/loadActionBeatmaps",e);this.$http.isError(t)||this.$store.commit("setActionBeatmaps",t),this.$store.commit("setActionBeatmapsLoading",!1)}}))},loadActionQuests(e){return ut(this,void 0,void 0,(function*(){this.$store.commit("setActionQuests",[]),this.$store.commit("setActionQuestsLoading",!0);const t=yield this.$http.executeGet("/admin/loadActionQuests",e);this.$http.isError(t)||this.$store.commit("setActionQuests",t),this.$store.commit("setActionQuestsLoading",!1)}))},loadActionUsers(e){return ut(this,void 0,void 0,(function*(){this.$store.commit("setActionUsers",[]),this.$store.commit("setActionUsersLoading",!0);const t=yield this.$http.executeGet("/admin/loadActionUsers",e);this.$http.isError(t)||this.$store.commit("setActionUsers",t),this.$store.commit("setActionUsersLoading",!1)}))},updateUserPoints(e){return ut(this,void 0,void 0,(function*(){this.calculatingPoints=!0,(yield this.$http.executePost("/admin/users/updateAllUserPoints",{},e))&&(this.calculatingPoints=!1)}))}}});lt.render=function(e,t,s,Y,ee,te){const se=(0,o.resolveComponent)("modes-icons"),oe=(0,o.resolveComponent)("user-link"),ae=(0,o.resolveComponent)("beatmap-info-admin"),ie=(0,o.resolveComponent)("quest-info"),ne=(0,o.resolveComponent)("review-quest"),re=(0,o.resolveComponent)("user-info"),ce=(0,o.resolveDirective)("bs-tooltip");return(0,o.openBlock)(),(0,o.createBlock)("div",null,[(0,o.createVNode)("div",a,[(0,o.createVNode)("div",i,[(0,o.createVNode)("button",{class:"btn btn-sm btn-info w-100 mb-1",onClick:t[1]||(t[1]=t=>e.loadActionBeatmaps(t,!1))}," Load beatmaps ")]),(0,o.createVNode)("div",n,[(0,o.createVNode)("div",r,[(0,o.createVNode)("h5",c,[d,e.actionBeatmapsLoading?((0,o.openBlock)(),(0,o.createBlock)("span",u,"loading...")):(0,o.createCommentVNode)("",!0)]),(0,o.createVNode)("div",l,[e.actionBeatmaps.length?((0,o.openBlock)(),(0,o.createBlock)("table",p,[m,(0,o.createVNode)("tbody",null,[((0,o.openBlock)(!0),(0,o.createBlock)(o.Fragment,null,(0,o.renderList)(e.actionBeatmaps,(t=>((0,o.openBlock)(),(0,o.createBlock)("tr",{key:t.id,class:"text-white-50"},[(0,o.createVNode)("td",h,[(0,o.createVNode)(se,{modes:[t.mode]},null,8,["modes"]),t.url?((0,o.openBlock)(),(0,o.createBlock)("a",{key:0,href:t.url,class:"ms-1"},(0,o.toDisplayString)(e.generateMetadata(t.song)),9,["href"])):((0,o.openBlock)(),(0,o.createBlock)("span",f,(0,o.toDisplayString)(e.generateMetadata(t.song)),1))]),(0,o.createVNode)("td",g,(0,o.toDisplayString)(t.packId),1),(0,o.createVNode)("td",y,(0,o.toDisplayString)(t.status),1),(0,o.createVNode)("td",k,[(0,o.createVNode)("a",{href:"#","data-bs-toggle":"modal","data-bs-target":"#editBeatmap",onClick:(0,o.withModifiers)((s=>e.$store.commit("setSelectedBeatmap",t)),["prevent"])}," edit ",8,["onClick"])])])))),128))])])):e.actionBeatmapsLoading?(0,o.createCommentVNode)("",!0):((0,o.openBlock)(),(0,o.createBlock)("span",v,"None..."))])])])]),(0,o.createVNode)("div",N,[(0,o.createVNode)("div",V,[(0,o.createVNode)("button",{class:"btn btn-sm btn-info w-100 mb-1",onClick:t[2]||(t[2]=t=>e.loadActionQuests(t))}," Load quests ")]),(0,o.createVNode)("div",b,[(0,o.createVNode)("div",w,[(0,o.createVNode)("h5",I,[B,e.actionQuestsLoading?((0,o.openBlock)(),(0,o.createBlock)("span",q,"loading...")):(0,o.createCommentVNode)("",!0)]),(0,o.createVNode)("div",x,[e.actionQuests.length?((0,o.openBlock)(),(0,o.createBlock)("table",$,[M,(0,o.createVNode)("tbody",null,[((0,o.openBlock)(!0),(0,o.createBlock)(o.Fragment,null,(0,o.renderList)(e.actionQuests,(t=>((0,o.openBlock)(),(0,o.createBlock)("tr",{key:t.id,class:"text-white-50"},[(0,o.createVNode)("td",P,(0,o.toDisplayString)(t.name),1),(0,o.createVNode)("td",C,(0,o.toDisplayString)(t.creator.username),1),(0,o.createVNode)("td",D,[(0,o.createVNode)(se,{modes:t.modes},null,8,["modes"])]),(0,o.createVNode)("td",S,(0,o.toDisplayString)(t.status),1),(0,o.createVNode)("td",U,(0,o.toDisplayString)(t.requiredMapsets),1),(0,o.createVNode)("td",Q,[(0,o.createVNode)("a",{href:"#","data-bs-toggle":"modal","data-bs-target":"pending"==t.status?"#reviewQuest":"#editQuest",onClick:(0,o.withModifiers)((s=>e.$store.commit("setSelectedQuest",t)),["prevent"])}," edit ",8,["data-bs-target","onClick"])])])))),128))])])):e.actionQuestsLoading?(0,o.createCommentVNode)("",!0):((0,o.openBlock)(),(0,o.createBlock)("span",T,"None..."))])])])]),(0,o.createVNode)("div",A,[(0,o.createVNode)("div",L,[(0,o.createVNode)("button",{class:"btn btn-sm btn-info w-100 mb-1",onClick:t[3]||(t[3]=t=>e.updateUserPoints(t))}," Update user points "),e.calculatingPoints?((0,o.openBlock)(),(0,o.createBlock)("span",R,"calculating points...")):(0,o.createCommentVNode)("",!0),(0,o.createVNode)("button",{class:"btn btn-sm btn-info w-100 mb-1",onClick:t[4]||(t[4]=t=>e.loadActionUsers(t))}," Load users ")]),(0,o.createVNode)("div",E,[(0,o.createVNode)("div",j,[(0,o.createVNode)("h5",O,[F,e.actionUsersLoading?((0,o.openBlock)(),(0,o.createBlock)("span",G,"loading...")):(0,o.createCommentVNode)("",!0)]),e.actionUsers?((0,o.openBlock)(),(0,o.createBlock)("div",Z,[e.actionUsers.length?((0,o.openBlock)(),(0,o.createBlock)("table",z,[_,(0,o.createVNode)("tbody",null,[((0,o.openBlock)(!0),(0,o.createBlock)(o.Fragment,null,(0,o.renderList)(e.actionUsers,(t=>((0,o.openBlock)(),(0,o.createBlock)("tr",{key:t.id,class:"text-white-50"},[(0,o.createVNode)("td",W,[(0,o.createVNode)(oe,{user:t},null,8,["user"])]),(0,o.createVNode)("td",K,[t.rank>0?(0,o.withDirectives)(((0,o.openBlock)(),(0,o.createBlock)("i",{key:0,class:["fas fa-crown","text-rank-"+t.rank]},null,2)),[[ce,`rank ${t.rank} user`]]):(0,o.createCommentVNode)("",!0)]),(0,o.createVNode)("td",{scope:"row",class:{"bg-open":t.rank!=t.badge}},[t.badge>0?(0,o.withDirectives)(((0,o.openBlock)(),(0,o.createBlock)("i",{key:0,class:["fas fa-crown","text-rank-"+t.rank]},null,2)),[[ce,`rank ${t.rank} user`]]):(0,o.createCommentVNode)("",!0)],2),(0,o.createVNode)("td",H,[(0,o.createVNode)("a",{href:"#","data-bs-toggle":"modal","data-bs-target":"#editUser",onClick:(0,o.withModifiers)((s=>e.$store.commit("setSelectedUser",t)),["prevent"])}," edit ",8,["onClick"])])])))),128))])])):e.actionUsersLoading?(0,o.createCommentVNode)("",!0):((0,o.openBlock)(),(0,o.createBlock)("span",J,"None..."))])):(0,o.createCommentVNode)("",!0)])])]),X,e.selectedBeatmap?((0,o.openBlock)(),(0,o.createBlock)(ae,{key:0,beatmap:e.selectedBeatmap},null,8,["beatmap"])):(0,o.createCommentVNode)("",!0),e.selectedQuest?((0,o.openBlock)(),(0,o.createBlock)(ie,{key:1,quest:e.selectedQuest},null,8,["quest"])):(0,o.createCommentVNode)("",!0),e.selectedQuest?((0,o.openBlock)(),(0,o.createBlock)(ne,{key:2,quest:e.selectedQuest},null,8,["quest"])):(0,o.createCommentVNode)("",!0),e.selectedUser?((0,o.openBlock)(),(0,o.createBlock)(re,{key:3,user:e.selectedUser},null,8,["user"])):(0,o.createCommentVNode)("",!0)])};const pt=lt}}]);