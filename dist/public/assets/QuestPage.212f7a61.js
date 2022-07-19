var e=Object.defineProperty,t=Object.defineProperties,s=Object.getOwnPropertyDescriptors,a=Object.getOwnPropertySymbols,r=Object.prototype.hasOwnProperty,i=Object.prototype.propertyIsEnumerable,n=(t,s,a)=>s in t?e(t,s,{enumerable:!0,configurable:!0,writable:!0,value:a}):t[s]=a,o=(e,t)=>{for(var s in t||(t={}))r.call(t,s)&&n(e,s,t[s]);if(a)for(var s of a(t))i.call(t,s)&&n(e,s,t[s]);return e},u=(e,a)=>t(e,s(a));import{d as l,m as d,G as c,i as p,o as m,b as y,j as h,w as f,f as q,l as b,p as g,a as v,k as Q,q as k,F as P,g as $,e as x,t as w,n as I,s as M,u as O,x as j,O as U,P as D,J as A,H as L}from"./vendor.8b5721c7.js";import{_ as C}from"./FilterBox.9b15950d.js";import{_ as S}from"./ModeFilters.95a9c179.js";import{_ as E}from"./ModesIcons.88090f43.js";import{_ as F}from"./SubmitQuestModal.c934a353.js";import{_ as T}from"./AssociatedBeatmaps.6385f459.js";import{_ as R}from"./ModalDialog.2c18b0dc.js";import{h as _,i as V}from"./index.58f81b45.js";import{F as W}from"./extras.b9e74742.js";import"./beatmap.b8797e7f.js";var B=l({components:{FilterBox:C,ModeFilters:S},computed:u(o(o({},d(["loggedInUser"])),d("quests",["filterMode"])),{validRank(){return this.loggedInUser.rank>=1}}),methods:c("quests",["updateFilterValue","searchQuests"])});const z={class:"container card card-body py-3 mb-2"},N=["disabled","data-bs-toggle","title","data-bs-target"],Y=[b(" Submit quest for approval "),q("i",{class:"fas fa-plus fa-xs"},null,-1)];B.render=function(e,t,s,a,r,i){const n=p("mode-filters"),o=p("filter-box");return m(),y("div",z,[h(o,{placeholder:"enter to search for quest...","onUpdate:filterValue":t[1]||(t[1]=t=>e.updateFilterValue(t))},{filters:f((()=>[h(n,{"filter-mode":e.filterMode,"onUpdate:filterMode":t[0]||(t[0]=t=>e.searchQuests(t))},null,8,["filter-mode"])])),default:f((()=>[q("button",{class:"btn btn-primary",disabled:!e.validRank,"data-bs-toggle":e.validRank?"modal":"tooltip",title:e.validRank?"":"designing custom quests is available to tier 1+ users only","data-bs-target":e.validRank?"#submitQuest":""},Y,8,N)])),_:1})])};var G=l({name:"QuestSize",props:{quest:{type:Object,required:!0}}});g("data-v-b000696e");const H={class:"small pe-2"},J={key:0},K={key:1};v(),G.render=function(e,t,s,a,r,i){const n=Q("bs-tooltip");return k((m(),y("span",H,["open"==e.quest.status?(m(),y("span",J,[(m(!0),y(P,null,$(e.quest.minParty,(e=>(m(),y("i",{key:e,class:"fas fa-user user-icon"})))),128)),(m(!0),y(P,null,$(e.quest.maxParty-e.quest.minParty,(e=>(m(),y("i",{key:e+100,class:"fas text-white-50 fa-user user-icon"})))),128))])):"wip"==e.quest.status||"done"==e.quest.status?(m(),y("span",K,[(m(!0),y(P,null,$(e.quest.currentParty.members,(e=>(m(),y("i",{key:e.id,class:"fas fa-user user-icon"})))),128))])):x("",!0)],512)),[[n,"Party size: "+(e.quest.minParty==e.quest.maxParty?`${e.quest.minParty} user${1==e.quest.maxParty?"":"s"}`:"open"==e.quest.status?`${e.quest.minParty}-${e.quest.maxParty} users`:"wip"==e.quest.status||"done"==e.quest.status?`${e.quest.currentParty.members.length} user${1==e.quest.currentParty.members.length?"":"s"}`:"")]])},G.__scopeId="data-v-b000696e";var X=l({name:"QuestPrice",props:{price:{type:Number,default:0}}});const Z=q("i",{class:"fas fa-coins me-1"},null,-1),ee={class:"text-white-50"};X.render=function(e,t,s,a,r,i){const n=Q("bs-tooltip");return m(),y("small",null,[Z,k(q("span",ee,[b(w(e.price)+"pt"+w(1==e.price?"":"s"),1)],512),[[n,"points required from each party member to start quest"]])])};var te=l({name:"QuestTime",props:{timeframe:{type:Number,required:!0}}});const se=q("i",{class:"far fa-clock me-1"},null,-1),ae={class:"text-white-50"};te.render=function(e,t,s,a,r,i){const n=Q("bs-tooltip");return m(),y("small",null,[se,k(q("span",ae,[b(w(Math.round(e.timeframe/864e5))+" days",1)],512),[[n,"days to complete the quest"]])])};var re=l({name:"QuestModes",components:{ModesIcons:E},props:{status:{type:String,required:!0},modes:{type:Array,required:!0}}});const ie=b(" Modes: ");re.render=function(e,t,s,a,r,i){const n=p("modes-icons");return m(),y("small",null,[ie,h(n,{modes:e.modes},null,8,["modes"])])};var ne=l({name:"QuestCard",components:{QuestSize:G,QuestPrice:X,QuestTime:te,QuestModes:re},props:{quest:{type:Object,required:!0}},computed:u(o({},d(["loggedInUser"])),{timeRemaining(){const e=(new Date).getTime(),t=new Date(this.quest.deadline).getTime()-e;return Math.floor(t/864e5)},memberOfAnyParty(){return this.quest.parties.some((e=>e.members.some((e=>e.id===this.loggedInUser.id))))},cardClass(){return"wip"==this.quest.status&&this.timeRemaining<0?"overdue":this.quest.minRank?"rank-restricted":""},questIcon(){return this.quest.isMbc?"/images/mbc-icon.png":this.quest.art?"https://assets.ppy.sh/artists/"+this.quest.art+"/cover.jpg":"/images/no-art-icon.png"}}),methods:{selectQuest(){this.$store.commit("quests/setSelectedQuestId",this.quest.id),this.$route.query.id!==this.quest.id&&this.$router.replace(`/quests?id=${this.quest.id}`)}}});g("data-v-78e2cf54");const oe={class:"col-sm-1 text-center"},ue=["src"],le={class:"col-sm-11"},de={class:"row no-gutters"},ce={class:"col-sm-5"},pe={class:"col-sm-7"},me={class:"row no-gutters"},ye={class:"col-sm-4"},he={key:0,class:"fas fa-star-of-life fa-xs text-primary me-1"},fe={class:"col-sm-2"},qe={class:"col-sm-2"},be={class:"col-sm-4"},ge={class:"row no-gutters"},ve={class:"col-sm small text-white-50"};v(),ne.render=function(e,t,s,a,r,i){const n=p("quest-size"),o=p("quest-price"),u=p("quest-time"),l=p("quest-modes"),d=Q("bs-tooltip");return m(),y("div",null,[q("div",{class:I(["container card card-body card-level-2 my-1 p-1",e.cardClass]),style:{cursor:"pointer"}},[q("div",{class:"row no-gutters align-items-center","data-bs-toggle":"modal","data-bs-target":"#editQuest",onClick:t[0]||(t[0]=(...t)=>e.selectQuest&&e.selectQuest(...t))},[q("div",oe,[q("img",{src:e.questIcon,class:"card-avatar-img"},null,8,ue)]),q("div",le,[q("div",de,[q("div",ce,w(e.quest.name.length>40?e.quest.name.slice(0,40)+"...":e.quest.name),1),q("div",pe,[q("div",me,[q("div",ye,["open"==e.quest.status&&e.quest.parties.some((e=>!e.lock))?k((m(),y("i",he,null,512)),[[d,"quest has joinable party"]]):x("",!0),h(n,{quest:e.quest},null,8,["quest"])]),q("div",fe,[h(o,{price:e.quest.price},null,8,["price"])]),q("div",qe,[h(u,{timeframe:e.quest.timeframe},null,8,["timeframe"])]),q("div",be,[h(l,{status:e.quest.status,modes:e.quest.modes},null,8,["status","modes"])])])])]),q("div",ge,[q("div",ve,w(e.quest.descriptionMain),1)])])])],2)])},ne.__scopeId="data-v-78e2cf54";var Qe=l({components:{QuestCard:ne},props:{status:{type:String,required:!0},quests:{type:Array,required:!0}},data(){return{collapsed:"Open"===this.status}},computed:u(o({},d("quests",["isLoadingQuests","isFirstLoadDone"])),{questCount(){return this.openQuests&&!this.isFirstLoadDone||!this.isLoadingQuests?this.quests.length.toString():"..."},openQuests(){return"Open"===this.status}})});const ke={class:"container card card-body my-2"},Pe=["href"],$e=["id"],xe={class:"col-sm"};Qe.render=function(e,t,s,a,r,i){const n=p("quest-card");return m(),y("div",ke,[q("h5",{class:I(e.collapsed?"mb-2":"mb-0")},[q("a",{href:"#"+e.status,"data-bs-toggle":"collapse",onClick:t[0]||(t[0]=M((t=>e.collapsed=!e.collapsed),["prevent"]))},[b(w(e.status)+" quests ("+w(e.questCount)+") ",1),q("i",{class:I(["fas",e.collapsed?"fa-angle-up":"fa-angle-down"])},null,2)],8,Pe)],2),q("div",{id:e.status,class:I(["row",{"loading-data":e.isLoadingQuests&&e.isFirstLoadDone,show:e.openQuests,collapse:!e.openQuests}])},[q("div",xe,[h(j,{name:"list",tag:"div"},{default:f((()=>[(m(!0),y(P,null,$(e.quests,(e=>(m(),O(n,{key:e.id,quest:e},null,8,["quest"])))),128))])),_:1})])],10,$e)])};var we=l({name:"LeaderActions",props:{party:{type:Object,required:!0},status:{type:String,required:!0},quest:{type:Object,required:!0},price:{type:Number,required:!0}},data:()=>({inviteUsername:"",dropdownUserId:""}),computed:u(o({},d(["loggedInUser"])),{enoughPoints(){let e=!0;return this.party.members.forEach((t=>{t.availablePoints<this.price&&(e=!1)})),e}}),methods:{async togglePartyLock(e){const t=await this.$http.executePost(`/parties/${this.party.id}/toggleLock`,{},e);this.$http.isError(t)||this.$store.dispatch("quests/updateParty",t)},async inviteToParty(e){const t=await this.$http.executePost(`/parties/${this.party.id}/invite`,{username:this.inviteUsername},e);this.$http.isError(t)||this.$store.dispatch("updateToastMessages",{message:t.success,type:"success"})},async transferPartyLeader(e){if(!this.dropdownUserId)return void this.$store.dispatch("updateToastMessages",{message:"Select a member to transfer leadership!",type:"info"});const t=await this.$http.executePost(`/parties/${this.party.id}/transferLeadership`,{userId:this.dropdownUserId},e);this.$http.isError(t)||this.$store.dispatch("quests/updateParty",t)},async kickPartyMember(e){if(this.dropdownUserId){if(confirm("Are you sure? "+(this.party.members.length==this.quest.minParty&&"wip"==this.quest.status?"This party has the minimum required members to run the quest, so kicking will cause the quest to be dropped.":""))){const t=await this.$http.executePost(`/parties/${this.party.id}/kick`,{userId:this.dropdownUserId},e);this.$http.isError(t)||(this.$store.dispatch("quests/updateParty",t),"wip"==this.quest.status&&(t.members.length<this.quest.minParty||t.rank<this.quest.minRank)&&this.dropQuest(e))}}else this.$store.dispatch("updateToastMessages",{message:"Select a member to kick :(",type:"info"})},async extendDeadline(e){if(confirm(`Are you sure?\n\nAll members of your party will spend 10 points.\n\nYou have ${this.loggedInUser.availablePoints} points available.`)){const t=await this.$http.executePost(`/quests/${this.quest.id}/extendDeadline`,{},e);this.$http.isError(t)||(this.$store.dispatch("quests/updateQuest",t.quest),this.$store.commit("setAvailablePoints",t.availablePoints))}},async dropQuest(e){if(confirm("Are you sure?")){const t=await this.$http.executePost(`/quests/${this.quest.id}/drop`,{},e);this.$http.isError(t)||(this.$bs.hideModal("editQuest"),this.$store.dispatch("quests/setQuests",t))}},async acceptQuest(e){const t=this.party.modes;let s="";for(let a=0;a<t.length;a++)s+=t[a],a<t.length-1&&(s+=", ");if(confirm(`Are you sure?\n\nThis quest will only allow beatmaps of these modes: ${s}\n\nAll members of your party will spend ${this.price} points.\n\nYou have ${this.loggedInUser.availablePoints} points available.`)){const t=await this.$http.executePost(`/quests/${this.quest.id}/accept`,{},e);this.$http.isError(t)||(this.$store.dispatch("quests/setQuests",t.quests),this.$store.commit("setAvailablePoints",t.availablePoints),this.$bs.hideModal("editQuest"))}},async deleteParty(e){if(confirm("Are you sure?")){const t=await this.$http.executePost(`/parties/${this.party.id}/delete`,{},e);this.$http.isError(t)||(this.$store.dispatch("quests/updateQuest",t),this.$bs.hideModal("editQuest"))}}}});const Ie={class:"row row-cols-md-auto g-2 align-items-center mb-3"},Me={class:"col-12"},Oe={class:" input-group input-group-sm"},je=[b(" Invite ")],Ue={class:"col-12"},De={class:"input-group input-group-sm"},Ae=q("option",{value:"",disabled:""}," Select a member ",-1),Le=["value"],Ce=[b(" Lead ")],Se=[b(" Kick ")],Ee={class:"col-12"},Fe={class:"col-12"},Te=[b(" Delete "),q("i",{class:"fas fa-minus fa-xs"},null,-1)],Re={class:"col-12"},_e=[b(" Extend deadline for 10 points "),q("i",{class:"fas fa-coins fa-xs"},null,-1)],Ve={class:"col-12"},We=[b(" Drop quest "),q("i",{class:"fas fa-times fa-xs"},null,-1)],Be={key:2,class:"col-12"},ze=["disabled"];var Ne,Ye;we.render=function(e,t,s,a,r,i){const n=Q("bs-tooltip");return m(),y("div",Ie,[q("div",Me,[q("div",Oe,[k(q("input",{"onUpdate:modelValue":t[0]||(t[0]=t=>e.inviteUsername=t),class:"form-control",type:"text",placeholder:"username...",maxlength:"18",onKeyup:t[1]||(t[1]=D((t=>e.inviteToParty(t)),["enter"]))},null,544),[[U,e.inviteUsername]]),k(q("button",{class:"btn btn-outline-info",onClick:t[2]||(t[2]=t=>e.inviteToParty(t))},je,512),[[n,"invite user to party"]])])]),q("div",Ue,[q("div",De,[k(q("select",{"onUpdate:modelValue":t[3]||(t[3]=t=>e.dropdownUserId=t),class:"form-select"},[Ae,(m(!0),y(P,null,$(e.party.members,(t=>(m(),y(P,{key:t.id},[t.id!==e.loggedInUser.id?(m(),y("option",{key:0,value:t.id},w(t.username),9,Le)):x("",!0)],64)))),128))],512),[[A,e.dropdownUserId]]),k(q("button",{class:"btn btn-outline-info",onClick:t[4]||(t[4]=t=>e.transferPartyLeader(t))},Ce,512),[[n,"change party leader"]]),k(q("button",{class:"btn btn-outline-info",onClick:t[5]||(t[5]=t=>e.kickPartyMember(t))},Se,512),[[n,"kick party member"]])])]),"open"===e.status?(m(),y(P,{key:0},[q("div",Ee,[q("button",{class:"btn btn-sm btn-outline-info w-100",onClick:t[6]||(t[6]=M((t=>e.togglePartyLock(t)),["prevent"]))},[b(w(e.party.lock?"Unlock":"Lock")+" ",1),q("i",{class:I(["fas",e.party.lock?"fa-unlock":"fa-lock"])},null,2)])]),q("div",Fe,[q("button",{class:"btn btn-sm btn-outline-danger w-100",onClick:t[7]||(t[7]=M((t=>e.deleteParty(t)),["prevent"]))},Te)])],64)):x("",!0),"wip"===e.status?(m(),y(P,{key:1},[q("div",Re,[k(q("button",{class:"btn btn-sm btn-outline-danger w-100",onClick:t[8]||(t[8]=M((t=>e.extendDeadline(t)),["prevent"]))},_e,512),[[n,"each party member spends 10 points to extend quest deadline"]])]),q("div",Ve,[q("button",{class:"btn btn-sm btn-outline-danger w-100",onClick:t[9]||(t[9]=M((t=>e.dropQuest(t)),["prevent"]))},We)])],64)):"open"===e.quest.status&&e.party.rank>=e.quest.minRank&&e.party.members.length>=e.quest.minParty&&e.party.members.length<=e.quest.maxParty?(m(),y("div",Be,[q("button",{class:"btn btn-sm btn-outline-success w-100",disabled:!e.enoughPoints,onClick:t[10]||(t[10]=M((t=>e.acceptQuest(t)),["prevent"]))},[b(w(e.price?`Accept quest for ${e.price} ${1==e.price?"point":"points"} from each party member`:"Accept Quest")+" ",1),q("i",{class:I(["fas small",e.price?"fa-coins":"fa-check"])},null,2)],8,ze)])):x("",!0)])},(Ye=Ne||(Ne={})).Open="open",Ye.WIP="wip",Ye.Done="done",Ye.Pending="pending",Ye.Rejected="rejected",Ye.Hidden="hidden",Ye.Scheduled="scheduled";var Ge=l({props:{party:{type:Object,default:null},quest:{type:Object,default:null}},computed:u(o({},d(["loggedInUser"])),{isWip(){var e;return(null==(e=this.quest)?void 0:e.status)==Ne.WIP},isOpen(){var e;return(null==(e=this.quest)?void 0:e.status)==Ne.Open},isDone(){var e;return(null==(e=this.quest)?void 0:e.status)==Ne.Done},isLeader(){var e;return(null==(e=this.party)?void 0:e.leader.id)==this.loggedInUser.id}})}),He=l({mixins:[Ge],props:{party:{type:Object,required:!0}}});const Je={key:0,class:"fas fa-lock fa-sm"},Ke={key:1,class:"fas fa-unlock fa-sm"};He.render=function(e,t,s,a,r,i){const n=Q("bs-tooltip");return m(),y("span",null,[e.party.lock?k((m(),y("i",Je,null,512)),[[n,"party is invite-only"]]):k((m(),y("i",Ke,null,512)),[[n,"party is open"]])])};var Xe=l({name:"PartyTitle",components:{LockDetail:He},mixins:[Ge],props:{party:{type:Object,required:!0},quest:{type:Object,required:!0},memberOfAnyParty:Boolean},computed:u(o({},d(["loggedInUser"])),{inCurrentParty(){return this.party.members.some((e=>e.id===this.loggedInUser.id))}}),methods:{async joinParty(e){const t=await this.$http.executePost(`/parties/${this.party.id}/join`,{},e);this.$http.isError(t)||this.$store.dispatch("quests/updateParty",t)},async leaveParty(e){if(confirm("Are you sure? "+(this.party.members.length==this.quest.minParty&&this.isWip?"This party has the minimum required members to run the quest, so leaving will cause the quest to be dropped.":""))){const t=await this.$http.executePost(`/parties/${this.party.id}/leave`,{},e);this.$http.isError(t)||(this.$store.dispatch("quests/updateParty",t),this.isWip&&(t.members.length<this.quest.minParty||t.rank<this.quest.minRank)&&this.dropQuest(e))}},async dropQuest(e){const t=await this.$http.executePost(`/quests/${this.quest.id}/drop`,{},e);this.$http.isError(t)||(this.$store.dispatch("quests/setQuests",t),this.$bs.hideModal("editQuest"))}}});const Ze={class:"row"},et={class:"col-sm"},tt={class:"d-inline-block"},st=b("'s party "),at=[b(" Join "),q("i",{class:"fas fa-user-plus fa-xs"},null,-1)],rt=[b(" Leave "),q("i",{class:"fas fa-user-minus fa-xs"},null,-1)];Xe.render=function(e,t,s,a,r,i){const n=p("user-link"),o=p("lock-detail"),u=Q("bs-tooltip");return m(),y("div",Ze,[q("div",et,[q("h5",tt,[h(n,{user:e.party.leader},null,8,["user"]),st]),e.party.rank>0?k((m(),y("i",{key:0,class:I(["fas fa-crown fa-sm mx-1","text-rank-"+e.party.rank])},null,2)),[[u,`rank ${e.party.rank} party`]]):x("",!0),e.isOpen?(m(),O(o,{key:1,party:e.party},null,8,["party"])):x("",!0),e.loggedInUser.id!=e.party.leader.id?(m(),y(P,{key:2},[e.memberOfAnyParty||e.party.lock||!e.isOpen?x("",!0):(m(),y("button",{key:0,class:"btn btn-sm btn-outline-info ms-1",onClick:t[0]||(t[0]=M((t=>e.joinParty(t)),["prevent"]))},at)),e.inCurrentParty&&(e.isOpen||e.isWip)?(m(),y("button",{key:1,class:"btn btn-sm btn-outline-danger ms-1",onClick:t[1]||(t[1]=M((t=>e.leaveParty(t)),["prevent"]))},rt)):x("",!0)],64)):x("",!0)])])};var it=l({props:{quest:{type:Object,required:!0}},computed:{timeRemaining(){if(!this.quest.deadline)return 0;const e=(new Date).getTime(),t=new Date(this.quest.deadline).getTime()-e;return Math.floor(t/864e5)}}});const nt={class:"row"},ot={class:"col-sm"},ut={key:0,class:"ms-3"},lt=b(" Completed: "),dt={class:"text-secondary"},ct={key:1},pt={class:"ms-3"},mt=b(" Deadline: "),yt={class:"text-secondary"},ht={class:"ms-3"},ft=b(" Time remaining: ");it.render=function(e,t,s,a,r,i){return m(),y("div",nt,[q("div",ot,["done"===e.quest.status?(m(),y("div",ut,[lt,q("span",dt,w(e.quest.completed.toString().slice(0,10)),1)])):x("",!0),"wip"===e.quest.status?(m(),y("div",ct,[q("div",pt,[mt,q("span",yt,w(e.quest.deadline.toString().slice(0,10)),1)]),q("div",ht,[ft,q("span",{class:I(e.timeRemaining>0?"text-secondary":"text-danger")},w(e.timeRemaining)+" days",3)])])):x("",!0)])])};var qt=l({props:{members:{type:Array,required:!0},price:{type:Number,required:!0},status:{type:String,required:!0}}});const bt={class:"ms-3 mt-1"},gt={class:"mb-0"},vt={key:1,class:"text-danger"};qt.render=function(e,t,s,a,r,i){const n=p("user-link"),o=Q("bs-tooltip");return m(),y("div",bt,[q("b",null," Members: ("+w(e.members.length)+") ",1),q("ul",gt,[(m(!0),y(P,null,$(e.members,(t=>(m(),y("li",{key:t.id},[h(n,{class:"me-1",user:t},null,8,["user"]),t.rank>0?k((m(),y("i",{key:0,class:I(["fas fa-crown","text-rank-"+t.rank])},null,2)),[[o,`rank ${t.rank} user`]]):x("",!0),"open"==e.status&&t.availablePoints<e.price?(m(),y("span",vt,w(`(${t.availablePoints} points available)`),1)):x("",!0)])))),128))])])};var Qt=l({components:{ModesIcons:E},props:{party:{type:Object,required:!0},questId:{type:String,required:!0}},methods:{async togglePartyMode(e){const t=await this.$http.executePost(`/parties/${this.party.id}/toggleMode`,{mode:e});this.$http.isError(t)||this.$store.dispatch("quests/updateParty",t)}}});const kt={class:"ms-3 mt-1"},Pt=q("b",{class:"me-1"},"Modes:",-1);Qt.render=function(e,t,s,a,r,i){var n;const o=p("modes-icons");return m(),y("div",kt,[Pt,h(o,{modes:e.party.modes,toggler:e.party.leader.id==(null==(n=e.$store.state.loggedInUser)?void 0:n.id),onToggle:t[0]||(t[0]=t=>e.togglePartyMode(t))},null,8,["modes","toggler"])])};var $t=l({name:"PartyDetail",components:{LeaderActions:we,PartyTitle:Xe,QuestTiming:it,MembersDetail:qt,ModeDetail:Qt},mixins:[Ge],props:{party:{type:Object,default:null},quest:{type:Object,required:!0},memberOfAnyParty:Boolean},computed:o({},d(["loggedInUser"]))});const xt={class:"container card card-body mt-1"};$t.render=function(e,t,s,a,r,i){const n=p("leader-actions"),o=p("party-title"),u=p("quest-timing"),l=p("mode-detail"),d=p("members-detail");return m(),y("div",xt,[e.isOpen||e.isWip?(m(),y(P,{key:0},[e.party.leader.id==e.loggedInUser.id?(m(),O(n,{key:0,party:e.party,status:e.quest.status,quest:e.quest,price:e.quest.price},null,8,["party","status","quest","price"])):x("",!0),h(o,{party:e.party,quest:e.quest,"member-of-any-party":e.memberOfAnyParty},null,8,["party","quest","member-of-any-party"])],64)):x("",!0),e.isDone||e.isWip?(m(),O(u,{key:1,quest:e.quest},null,8,["quest"])):x("",!0),e.isOpen?(m(),O(l,{key:2,party:e.party,"quest-id":e.quest.id},null,8,["party","quest-id"])):x("",!0),h(d,{members:e.party.members,price:e.quest.price,status:e.quest.status},null,8,["members","price","status"])])};var wt=l({components:{PartyDetail:$t,AssociatedBeatmaps:T},mixins:[Ge],props:{quest:{type:Object,required:!0},memberOfAnyParty:Boolean,collapse:Boolean},methods:{async createParty(e){const t=await this.$http.executePost("/parties/create",{questId:this.quest.id},e);this.$http.isError(t)||this.$store.dispatch("quests/updateQuest",t)}}});const It={class:"container"},Mt={key:0,class:"row"},Ot={class:"col"},jt=[b(" Add party "),q("i",{class:"fas fa-plus fa-xs"},null,-1)],Ut={class:"col-sm-12"},Dt={key:0,class:"col-sm-12 mt-2"};wt.render=function(e,t,s,a,r,i){const n=p("party-detail"),o=p("associated-beatmaps");return m(),y("div",It,[e.isOpen&&!e.memberOfAnyParty?(m(),y("div",Mt,[q("div",Ot,[q("button",{class:"btn btn-sm w-100 btn-outline-info mb-2",onClick:t[0]||(t[0]=M((t=>e.createParty(t)),["prevent"]))},jt)])])):x("",!0),(m(!0),y(P,null,$(e.quest.parties,(t=>(m(),y("div",{key:t.id,class:"row"},[q("div",Ut,[h(n,{party:t,quest:e.quest,"member-of-any-party":e.memberOfAnyParty},null,8,["party","quest","member-of-any-party"])]),e.isDone||e.isWip?(m(),y("div",Dt,[h(o,{"associated-maps":e.quest.associatedMaps},null,8,["associated-maps"])])):x("",!0)])))),128))])};var At=l({name:"ExpirationDate",props:{isExpired:{type:Boolean,required:!0},expiration:{type:Date,required:!0}}});const Lt={class:"small"},Ct={class:"text-white-50"};At.render=function(e,t,s,a,r,i){return m(),y("div",Lt,[b(" Quest "+w(e.isExpired?"expired":"expires")+": ",1),q("span",Ct,w(e.expiration.toLocaleDateString()),1)])};var St=l({name:"ReopenQuest",props:{questId:{type:String,required:!0},status:{type:String,required:!0},price:{type:Number,required:!0}},computed:u(o({},d(["loggedInUser"])),{enoughPoints(){return this.loggedInUser.availablePoints-this.price>0}}),methods:{async reopenQuest(e){if(confirm(`Are you sure?\n\nYou are about to spend ${this.price} Mappers' Guild points to re-open this quest.\n\nYou have ${this.loggedInUser.availablePoints} points available.`)){const t=await this.$http.executePost(`/quests/${this.questId}/reopen`,{status:this.status},e);this.$http.isError(t)||(this.$store.dispatch("quests/setQuests",t.quests),this.$store.commit("setAvailablePoints",t.availablePoints),this.$bs.hideModal("editQuest"))}}}});const Et={class:"row"},Ft={class:"col-sm-12"},Tt=["disabled"],Rt=q("i",{class:"fas fa-coins fa-xs"},null,-1);St.render=function(e,t,s,a,r,i){return m(),y("div",Et,[q("div",Ft,[q("button",{class:"btn btn-sm w-100 btn-outline-success mb-2",disabled:!e.enoughPoints,onClick:t[0]||(t[0]=M((t=>e.reopenQuest(t)),["prevent"]))},[b(" Re-open quest for "+w(e.price)+" points ",1),Rt],8,Tt)])])};var _t=l({name:"QuestInfoModal",components:{QuestSize:G,QuestPrice:X,QuestTime:te,QuestModes:re,PartyInfo:wt,ModalDialog:R,ExpirationDate:At,ReopenQuest:St},computed:u(o(o({},d(["loggedInUser"])),L("quests",["selectedQuest"])),{memberOfAnyParty(){return this.selectedQuest.parties.some((e=>e.members.some((e=>e.id===this.loggedInUser.id))))},headerClass(){var e;return(null==(e=this.selectedQuest)?void 0:e.creator)?"pishifat"==this.selectedQuest.creator.username?"bg-warning":"bg-primary":""}})});g("data-v-6f9dbfb2");const Vt=["href"],Wt={key:0},Bt=b(" created by "),zt={key:1,class:"small"},Nt=["href"],Yt={class:"container"},Gt={class:"row"},Ht={class:"col-sm-12 text-center"},Jt={key:0},Kt=["href"],Xt=["src"],Zt={key:1},es=["src"],ts={class:"row mb-3 text-center"},ss={class:"col-sm-12"},as={class:"col-sm-12 text-white-50"},rs={class:"row justify-content-center text-center"},is={class:"col-sm-12"},ns={class:"col-sm-6 col-lg-2"},os={class:"col-sm-6 col-lg-2"},us={class:"col-sm-6 col-lg-4"},ls={key:0,class:"col-sm-6 col-lg-3"},ds=q("div",{class:"radial-divisor"},null,-1);v(),_t.render=function(e,t,s,a,r,i){const n=p("user-link"),o=p("quest-size"),u=p("quest-price"),l=p("quest-time"),d=p("quest-modes"),c=p("expiration-date"),b=p("reopen-quest"),g=p("party-info"),v=p("modal-dialog");return m(),O(v,{id:"editQuest","header-class":e.headerClass,loaded:Boolean(e.selectedQuest)},{header:f((()=>[q("a",{href:`/quests?id=${e.selectedQuest.id}`,target:"_blank",class:"text-dark"},w(e.selectedQuest.name),9,Vt),"pishifat"!=e.selectedQuest.creator.username?(m(),y("span",Wt,[Bt,h(n,{class:"text-dark",user:e.selectedQuest.creator},null,8,["user"])])):x("",!0),e.selectedQuest.art?(m(),y("div",zt,[q("a",{href:"https://osu.ppy.sh/beatmaps/artists/"+e.selectedQuest.art,target:"_blank"}," View featured artist listing ",8,Nt)])):x("",!0)])),default:f((()=>[q("div",Yt,[q("div",Gt,[q("div",Ht,[e.selectedQuest.art?(m(),y("span",Jt,[q("a",{href:"https://osu.ppy.sh/beatmaps/artists/"+e.selectedQuest.art,target:"_blank"},[q("img",{src:"https://assets.ppy.sh/artists/"+e.selectedQuest.art+"/cover.jpg",class:"card-avatar-img-modal"},null,8,Xt)],8,Kt)])):(m(),y("span",Zt,[q("img",{src:e.selectedQuest.isMbc?"/images/mbc-icon.png":"/images/no-art-icon.png",class:"card-avatar-img-modal"},null,8,es)]))])]),q("div",ts,[q("div",ss,[q("h5",null,w(e.selectedQuest.name),1)]),q("div",as,w(e.selectedQuest.descriptionMain),1)]),q("div",rs,[q("div",is,[h(o,{quest:e.selectedQuest},null,8,["quest"])]),q("div",ns,[h(u,{price:e.selectedQuest.price},null,8,["price"])]),q("div",os,[h(l,{timeframe:e.selectedQuest.timeframe},null,8,["timeframe"])]),q("div",us,[h(d,{status:e.selectedQuest.status,modes:e.selectedQuest.modes},null,8,["status","modes"])]),e.selectedQuest.expiration?(m(),y("div",ls,[h(c,{"is-expired":e.selectedQuest.isExpired,expiration:new Date(e.selectedQuest.expiration)},null,8,["is-expired","expiration"])])):x("",!0)]),ds,e.selectedQuest.isExpired?(m(),O(b,{key:0,"quest-id":e.selectedQuest.id,status:e.selectedQuest.status,price:e.selectedQuest.reopenPrice},null,8,["quest-id","status","price"])):(m(),O(g,{key:1,quest:e.selectedQuest,"member-of-any-party":e.memberOfAnyParty},null,8,["quest","member-of-any-party"]))])])),_:1},8,["header-class","loaded"])},_t.__scopeId="data-v-6f9dbfb2";const cs={updateQuest({commit:e},t){e("updateQuest",t)},updateParty({commit:e},t){e("updateParty",t)},setQuests({commit:e},t){e("setQuests",t)},updateFilterValue({commit:e},t){e("setFilterValue",t)},async loadQuests({commit:e,rootState:t},s){var a;const r=null==(a=t.loggedInUser)?void 0:a.mainMode;let i=`/quests/search?mode=${r}&status=${Ne.Open}`;s&&(i+=`&id=${s}`);const n=await _.initialRequest(i);V(n)||(e("setQuests",n),e("setFilterMode",r),s&&e("setSelectedQuestId",s))},async searchQuests({commit:e,state:t},s){s&&e("setFilterMode",s),e("setIsLoadingQuests",!0);const a=await _.executeGet(`/quests/search?mode=${t.filterMode}`);V(a)||e("setQuests",a),e("setIsLoadingQuests",!1)}};var ps={namespaced:!0,state:{quests:[],filterValue:"",filterMode:W.any,isLoadingQuests:!0,selectedQuestId:null,isFirstLoadDone:!1},mutations:{setFirstLoadDone(e){e.isFirstLoadDone=!0},setQuests(e,t){e.quests=t},setFilterValue(e,t){e.filterValue=t},setFilterMode(e,t){e.filterMode=t},setIsLoadingQuests(e,t){e.isLoadingQuests=t},setSelectedQuestId(e,t){e.selectedQuestId=t},updateQuest(e,t){const s=e.quests.findIndex((e=>e.id===t.id));-1!==s&&(e.quests[s]=t)},updateParty(e,t){const s=e.quests.findIndex((t=>t.id===e.selectedQuestId));if(-1!==s){const a=e.quests[s].parties.findIndex((e=>e.id===t.id));-1!==a&&(e.quests[s].parties[a]=t)}}},getters:{selectedQuest:e=>{if(e.selectedQuestId)return e.quests.find((t=>t.id===e.selectedQuestId))},filteredQuests:e=>{let t=e.quests;if(e.filterMode!==W.any){const s=e.filterMode;t=t.filter((e=>e.modes.includes(s)))}return e.filterValue.length>2&&(t=t.filter((t=>t.name.toLowerCase().includes(e.filterValue.toLowerCase())))),t},openQuests:(e,t)=>t.filteredQuests.filter((e=>e.status==Ne.Open&&!e.isExpired)),wipQuests:(e,t)=>t.filteredQuests.filter((e=>e.status==Ne.WIP)),completeQuests:(e,t)=>t.filteredQuests.filter((e=>e.status==Ne.Done)),expiredQuests:(e,t)=>t.filteredQuests.filter((e=>e.isExpired))},actions:cs},ms=l({name:"QuestPage",components:{QuestPageFilters:B,StatusQuests:Qe,SubmitQuestModal:F,QuestInfoModal:_t},computed:o(o({},d("quests",["isFirstLoadDone"])),L("quests",["openQuests","wipQuests","completeQuests","expiredQuests"])),beforeCreate(){this.$store.hasModule("quests")||this.$store.registerModule("quests",ps)},async created(){const e=this.$route.query.id;await this.$store.dispatch("quests/loadQuests",e),e&&this.$bs.showModal("editQuest"),await this.$store.dispatch("quests/searchQuests"),this.$store.commit("quests/setFirstLoadDone")}});const ys=q("div",{class:"radial-divisor"},null,-1),hs=q("div",{class:"radial-divisor"},null,-1);ms.render=function(e,t,s,a,r,i){const n=p("quest-page-filters"),o=p("status-quests"),u=p("submit-quest-modal"),l=p("quest-info-modal");return m(),y("div",null,[h(n),h(o,{status:"Open",quests:e.openQuests},null,8,["quests"]),ys,h(o,{status:"Work-in-progress",quests:e.wipQuests},null,8,["quests"]),hs,h(o,{status:"Complete",quests:e.completeQuests},null,8,["quests"]),h(o,{status:"Expired",quests:e.expiredQuests},null,8,["quests"]),h(u),h(l)])};export{ms as default};