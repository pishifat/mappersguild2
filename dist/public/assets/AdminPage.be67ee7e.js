var t=Object.defineProperty,s=Object.getOwnPropertySymbols,e=Object.prototype.hasOwnProperty,a=Object.prototype.propertyIsEnumerable,i=(s,e,a)=>e in s?t(s,e,{enumerable:!0,configurable:!0,writable:!0,value:a}):s[e]=a;import{d as o,p as n,a as r,h as d,o as c,s as l,w as u,k as p,t as m,j as h,f,q as g,b as y,l as b,H as I,m as A,i as w,e as q,F as v,g as k,n as $}from"./vendor.b9ef672a.js";import{_ as C}from"./BeatmapInfoAdmin.3272e860.js";import{_ as P}from"./QuestInfo.9360cb9f.js";import{_ as x}from"./ModalDialog.4a9168b4.js";import{_ as M}from"./CopyPaste.4b23b3fb.js";import{_ as Q}from"./UserInfo.ae97e797.js";import{_ as B}from"./FeaturedArtistInfo.3a60f15f.js";import{a as U,_ as L}from"./index.b6199a6d.js";import{_ as E}from"./UserLinkList.9aab0eb3.js";import{_ as T}from"./ArtistSearch.7c8abe90.js";import"./AssociatedBeatmaps.0baa50f4.js";var S=o({name:"ReviewQuest",components:{CopyPaste:M,ModalDialog:x},props:{quest:{type:Object,required:!0}},data(){return{showArtistInput:!1,artistInput:this.quest.art,showNameInput:!1,nameInput:this.quest.name,showObjectiveInput:!1,objectiveInput:this.quest.descriptionMain,showRequiredMapsetsInput:!1,requiredMapsetsInput:this.quest.requiredMapsets,showPriceInput:!1,priceInput:this.quest.price,showTimeframeInput:!1,timeframeInput:this.quest.timeframe/864e5,showPartySizeInput:!1,minPartyInput:this.quest.minParty,maxPartyInput:this.quest.maxParty}},watch:{quest(){this.showArtistInput=!1,this.artistInput=this.quest.art,this.showNameInput=!1,this.nameInput=this.quest.name,this.showObjectiveInput=!1,this.objectiveInput=this.quest.descriptionMain,this.showRequiredMapsetsInput=!1,this.requiredMapsetsInput=this.quest.requiredMapsets,this.showPriceInput=!1,this.priceInput=this.quest.price,this.showTimeframeInput=!1,this.timeframeInput=this.quest.timeframe/864e5}},methods:{async acceptPendingQuest(t){const s=await this.$http.executePost(`/admin/quests/${this.quest.id}/schedule`,{},t);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"scheduled quest",type:"info"}),this.$store.commit("updateStatus",{questId:this.quest.id,status:s}),this.$bs.hideModal("reviewQuest"))},async rejectPendingQuest(t){const s=await this.$http.executePost(`/admin/quests/${this.quest.id}/reject`,{},t);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"rejected quest",type:"info"}),this.$store.commit("updateStatus",{questId:this.quest.id,status:s}),this.$bs.hideModal("reviewQuest"))},async updateArt(t){const s=await this.$http.executePost(`/admin/quests/${this.quest.id}/updateArt`,{art:this.artistInput},t);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"updated artist",type:"info"}),this.$store.commit("updateArt",{questId:this.quest.id,art:s}),this.showArtistInput=!1)},async renameQuest(t){const s=await this.$http.executePost(`/admin/quests/${this.quest.id}/rename`,{name:this.nameInput},t);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"renamed quest",type:"info"}),this.$store.commit("renameQuest",{questId:this.quest.id,name:s}),this.showNameInput=!1)},async updateDescription(t){const s=await this.$http.executePost(`/admin/quests/${this.quest.id}/updateDescription/`,{description:this.objectiveInput},t);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"updated quest description",type:"info"}),this.$store.commit("updateDescription",{questId:this.quest.id,description:s}),this.showObjectiveInput=!1)},async updateRequiredMapsets(t){const s=await this.$http.executePost(`/admin/quests/${this.quest.id}/updateRequiredMapsets`,{requiredMapsets:this.requiredMapsetsInput},t);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"updated required mapsets",type:"info"}),this.$store.commit("updateRequiredMapsets",{questId:this.quest.id,requiredMapsets:s}),this.showRequiredMapsetsInput=!1)},async updatePrice(t){const s=await this.$http.executePost(`/admin/quests/${this.quest.id}/updatePrice`,{price:this.priceInput},t);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"updated price",type:"info"}),this.$store.commit("updatePrice",{questId:this.quest.id,price:s}),this.showPriceInput=!1)},async updateTimeframe(t){const s=await this.$http.executePost(`/admin/quests/${this.quest.id}/updateTimeframe`,{timeframe:this.timeframeInput},t);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"updated timeframe",type:"info"}),this.$store.commit("updateTimeframe",{questId:this.quest.id,timeframe:s}),this.showTimeframeInput=!1)},async updateMinParty(t){const s=await this.$http.executePost(`/admin/quests/${this.quest.id}/updateMinParty`,{minParty:this.minPartyInput},t);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"updated minParty",type:"info"}),this.$store.commit("updateMinParty",{questId:this.quest.id,minParty:s}),this.showPartySizeInput=!1)},async updateMaxParty(t){const s=await this.$http.executePost(`/admin/quests/${this.quest.id}/updateMaxParty`,{maxParty:this.maxPartyInput},t);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"updated maxParty",type:"info"}),this.$store.commit("updateMaxParty",{questId:this.quest.id,maxParty:s}),this.showPartySizeInput=!1)}}});n("data-v-205013f9");const F={class:"container"},j={class:"small text-secondary"},R=p(" Artist "),D=[f("i",{class:"fas fa-edit"},null,-1)],O={key:0},N={key:1,class:"ms-2"},_=["href"],G=["src"],z={key:2,class:"ms-2"},V={class:"small text-secondary"},K=p(" Name "),H=[f("i",{class:"fas fa-edit"},null,-1)],J={key:3},W={key:4,class:"ms-2"},X={class:"small text-secondary"},Y=p(" Objective "),Z=[f("i",{class:"fas fa-edit"},null,-1)],tt={key:5},st={key:6,class:"ms-2"},et={class:"small text-secondary"},at=p(" Required mapsets "),it=[f("i",{class:"fas fa-edit"},null,-1)],ot={key:7},nt={key:8,class:"ms-2"},rt={class:"small text-secondary"},dt=p(" Price "),ct=[f("i",{class:"fas fa-edit"},null,-1)],lt={key:9},ut={key:10,class:"ms-2"},pt={class:"small text-secondary"},mt=p(" Timeframe "),ht=[f("i",{class:"fas fa-edit"},null,-1)],ft={key:11},gt={key:12,class:"ms-2"},yt={class:"small text-secondary"},bt=p(" Party size "),It=[f("i",{class:"fas fa-edit"},null,-1)],At={key:13},wt={key:14,class:"ms-2"},qt=f("div",{class:"small text-secondary"}," Party rank ",-1),vt={class:"ms-2"},kt=f("div",{class:"small text-secondary"}," MBC ",-1),$t={class:"ms-2"},Ct=f("div",{class:"radial-divisor"},null,-1),Pt=f("button",{class:"btn btn-outline-secondary w-100","data-bs-toggle":"collapse","data-bs-target":"#forumPm"},[p(" See rejection message "),f("i",{class:"fas fa-angle-down"})],-1),xt={id:"forumPm",class:"collapse"},Mt=f("div",null,"hello, you're receiving this message because you submitted a Mappers' Guild quest for review",-1),Qt=f("div",null,"[box=your quest info]",-1),Bt=f("div",null,"[/box]",-1),Ut=f("div",null,"your quest has been rejected for the following reason(s):",-1),Lt=f("div",null,"[notice] REASONS [/notice]",-1),Et=f("div",null,"points spent for submitting the quest have been returned to your \"available points\" pool. if you'd like to modify the quest according to above feedback, you can resubmit it and i'll review it again! or if you'd like to submit any other quest, that's fine too!",-1),Tt=f("div",null,"thanks for being cool",-1);r(),S.render=function(t,s,e,a,i,o){const n=d("user-link"),r=d("copy-paste"),A=d("modal-dialog");return c(),l(A,{id:"reviewQuest",loaded:Boolean(t.quest)},{header:u((()=>[p(m(t.quest.name)+" by ",1),h(n,{class:"text-dark",user:t.quest.creator},null,8,["user"])])),default:u((()=>[f("div",F,[f("div",j,[R,f("a",{href:"#",onClick:s[0]||(s[0]=g((s=>t.showArtistInput=!t.showArtistInput),["prevent"]))},D)]),t.showArtistInput?(c(),y("p",O,[b(f("input",{"onUpdate:modelValue":s[1]||(s[1]=s=>t.artistInput=s),class:"form-control form-control-sm w-100",type:"number",autocomplete:"off",placeholder:"artist ID...",onChange:s[2]||(s[2]=s=>t.updateArt(s))},null,544),[[I,t.artistInput,void 0,{number:!0}]])])):t.quest.art?(c(),y("p",N,[f("a",{href:"https://osu.ppy.sh/beatmaps/artists/"+t.quest.art,target:"_blank"},[f("img",{src:"https://assets.ppy.sh/artists/"+t.quest.art+"/cover.jpg",class:"card-avatar-img"},null,8,G)],8,_)])):(c(),y("p",z," None ")),f("div",V,[K,f("a",{href:"#",onClick:s[3]||(s[3]=g((s=>t.showNameInput=!t.showNameInput),["prevent"]))},H)]),t.showNameInput?(c(),y("p",J,[b(f("input",{"onUpdate:modelValue":s[4]||(s[4]=s=>t.nameInput=s),class:"form-control form-control-sm w-100",type:"text",autocomplete:"off",placeholder:"name...",onChange:s[5]||(s[5]=s=>t.renameQuest(s))},null,544),[[I,t.nameInput]])])):(c(),y("p",W,m(t.quest.name),1)),f("div",X,[Y,f("a",{href:"#",onClick:s[6]||(s[6]=g((s=>t.showObjectiveInput=!t.showObjectiveInput),["prevent"]))},Z)]),t.showObjectiveInput?(c(),y("p",tt,[b(f("textarea",{"onUpdate:modelValue":s[7]||(s[7]=s=>t.objectiveInput=s),class:"form-control form-control-sm w-100",rows:"2",type:"text",autocomplete:"off",placeholder:"objective...",onChange:s[8]||(s[8]=s=>t.updateDescription(s))},null,544),[[I,t.objectiveInput]])])):(c(),y("p",st,m(t.quest.descriptionMain),1)),f("div",et,[at,f("a",{href:"#",onClick:s[9]||(s[9]=g((s=>t.showRequiredMapsetsInput=!t.showRequiredMapsetsInput),["prevent"]))},it)]),t.showRequiredMapsetsInput?(c(),y("p",ot,[b(f("input",{"onUpdate:modelValue":s[10]||(s[10]=s=>t.requiredMapsetsInput=s),class:"form-control form-control-sm w-100",type:"number",autocomplete:"off",placeholder:"required mapsets...",onChange:s[11]||(s[11]=s=>t.updateRequiredMapsets(s))},null,544),[[I,t.requiredMapsetsInput,void 0,{number:!0}]])])):(c(),y("p",nt,m(t.quest.requiredMapsets),1)),f("div",rt,[dt,f("a",{href:"#",onClick:s[12]||(s[12]=g((s=>t.showPriceInput=!t.showPriceInput),["prevent"]))},ct)]),t.showPriceInput?(c(),y("p",lt,[b(f("input",{"onUpdate:modelValue":s[13]||(s[13]=s=>t.priceInput=s),class:"form-control form-control-sm w-100",type:"number",autocomplete:"off",placeholder:"price per party member...",onChange:s[14]||(s[14]=s=>t.updatePrice(s))},null,544),[[I,t.priceInput,void 0,{number:!0}]])])):(c(),y("p",ut,m(t.quest.price)+" points per user ",1)),f("div",pt,[mt,f("a",{href:"#",onClick:s[15]||(s[15]=g((s=>t.showTimeframeInput=!t.showTimeframeInput),["prevent"]))},ht)]),t.showTimeframeInput?(c(),y("p",ft,[b(f("input",{"onUpdate:modelValue":s[16]||(s[16]=s=>t.timeframeInput=s),class:"form-control form-control-sm w-100",type:"number",autocomplete:"off",placeholder:"days...",onChange:s[17]||(s[17]=s=>t.updateTimeframe(s))},null,544),[[I,t.timeframeInput,void 0,{number:!0}]])])):(c(),y("p",gt,m(t.quest.timeframe/864e5)+" days ",1)),f("div",yt,[bt,f("a",{href:"#",onClick:s[18]||(s[18]=g((s=>t.showPartySizeInput=!t.showPartySizeInput),["prevent"]))},It)]),t.showPartySizeInput?(c(),y("p",At,[b(f("input",{"onUpdate:modelValue":s[19]||(s[19]=s=>t.minPartyInput=s),class:"form-control form-control-sm w-100",type:"number",autocomplete:"off",placeholder:"minimum",onChange:s[20]||(s[20]=s=>t.updateMinParty(s))},null,544),[[I,t.minPartyInput,void 0,{number:!0}]]),b(f("input",{"onUpdate:modelValue":s[21]||(s[21]=s=>t.maxPartyInput=s),class:"form-control form-control-sm w-100",type:"number",autocomplete:"off",placeholder:"maximum",onChange:s[22]||(s[22]=s=>t.updateMaxParty(s))},null,544),[[I,t.maxPartyInput,void 0,{number:!0}]])])):(c(),y("p",wt,m(t.quest.minParty)+"-"+m(t.quest.maxParty)+" members ",1)),qt,f("p",vt,m(t.quest.minRank)+" rank required ",1),kt,f("p",$t,m(t.quest.isMbc?"yes":"no"),1),Ct,f("button",{type:"submit",class:"btn btn-outline-success w-100",onClick:s[23]||(s[23]=s=>t.acceptPendingQuest(s))}," Schedule quest "),f("button",{type:"submit",class:"btn btn-outline-danger w-100",onClick:s[24]||(s[24]=s=>t.rejectPendingQuest(s))}," Reject quest "),Pt,f("div",xt,[h(r,null,{default:u((()=>[Mt,Qt,f("div",null,"Artist: "+m("https://osu.ppy.sh/beatmaps/artists/"+t.quest.art),1),f("div",null,"Name: "+m(t.quest.name),1),f("div",null,"Objective: "+m(t.quest.descriptionMain),1),f("div",null,"Required mapsets: "+m(t.quest.requiredMapsets),1),f("div",null,"Price: "+m(t.quest.price)+" points per user",1),f("div",null,"Timeframe: "+m(t.quest.timeframe/864e5)+" days",1),f("div",null,"Party size: "+m(t.quest.minParty)+"-"+m(t.quest.maxParty)+" members",1),Bt,Ut,Lt,Et,Tt])),_:1})])])])),_:1},8,["loaded"])},S.__scopeId="data-v-205013f9";var St=o({name:"ContestInfo",components:{ModalDialog:x},props:{contest:{type:Object,default:null}},methods:{async toggleIsApproved(t){const s=await this.$http.executePost(`/admin/contests/${this.contest.id}/toggleIsApproved`,{isApproved:!this.contest.isApproved},t);s&&(this.$store.dispatch("updateToastMessages",{message:`set isApproved to ${s.isApproved}`,type:"info"}),this.$store.commit("updateIsApproved",{contestId:this.contest.id,isApproved:s.isApproved}))},async toggleIsFeaturedArtistContest(t){const s=await this.$http.executePost(`/admin/contests/${this.contest.id}/toggleIsFeaturedArtistContest`,{isFeaturedArtistContest:!this.contest.isFeaturedArtistContest},t);s&&(this.$store.dispatch("updateToastMessages",{message:`set isFeaturedArtistContest to ${s.isFeaturedArtistContest}`,type:"info"}),this.$store.commit("updateIsFeaturedArtistContest",{contestId:this.contest.id,isFeaturedArtistContest:s.isFeaturedArtistContest}))},async toggleIsEligibleForPoints(t){const s=await this.$http.executePost(`/admin/contests/${this.contest.id}/toggleIsEligibleForPoints`,{isEligibleForPoints:!this.contest.isEligibleForPoints},t);s&&(this.$store.dispatch("updateToastMessages",{message:`set isEligibleForPoints to ${s.isEligibleForPoints}`,type:"info"}),this.$store.commit("updateIsEligibleForPoints",{contestId:this.contest.id,isEligibleForPoints:s.isEligibleForPoints}))}}});const Ft={class:"container"},jt={class:"row"},Rt={class:"col-sm-6"},Dt=p(" Featured Artist contest: "),Ot={class:"text-danger me-2"},Nt={class:"row"},_t={class:"col-sm-6"},Gt=p(" Eligible for points: "),zt={class:"text-danger me-2"},Vt=f("hr",null,null,-1),Kt={class:"row"},Ht={class:"col-sm-6"},Jt=p(" Publicly visible: "),Wt={class:"text-danger me-2"};St.render=function(t,s,e,a,i,o){const n=d("modal-dialog");return c(),l(n,{id:"editContest",loaded:Boolean(t.contest)},{header:u((()=>[p(m(t.contest.name),1)])),default:u((()=>[f("div",Ft,[f("p",jt,[f("span",Rt,[Dt,f("span",Ot,m(t.contest.isFeaturedArtistContest?"true":"false"),1)]),f("button",{class:"btn btn-sm btn-outline-info ms-3 w-25",onClick:s[0]||(s[0]=s=>t.toggleIsFeaturedArtistContest(s))}," Toggle ")]),f("p",Nt,[f("span",_t,[Gt,f("span",zt,m(t.contest.isEligibleForPoints?"true":"false"),1)]),f("button",{class:"btn btn-sm btn-outline-info ms-3 w-25",onClick:s[1]||(s[1]=s=>t.toggleIsEligibleForPoints(s))}," Toggle ")]),Vt,f("p",Kt,[f("span",Ht,[Jt,f("span",Wt,m(t.contest.isApproved?"true":"false"),1)]),f("button",{class:"btn btn-sm btn-outline-info ms-3 w-25",onClick:s[2]||(s[2]=s=>t.toggleIsApproved(s))}," Toggle ")])])])),_:1},8,["loaded"])};var Xt={state:{actionBeatmaps:[],actionBeatmapsLoading:!1,actionQuests:[],actionQuestsLoading:!1,actionUsers:[],actionUsersLoading:!1,actionContests:[],actionContestsLoading:!1,actionArtists:[],actionArtistsLoading:!1,selectedBeatmap:null,selectedQuest:null,selectedUser:null,selectedContest:null,selectedArtist:null},mutations:{setActionBeatmaps(t,s){t.actionBeatmaps=s},setActionBeatmapsLoading(t,s){t.actionBeatmapsLoading=s},setActionQuests(t,s){t.actionQuests=s},setActionQuestsLoading(t,s){t.actionQuestsLoading=s},setActionUsers(t,s){t.actionUsers=s},setActionUsersLoading(t,s){t.actionUsersLoading=s},setActionContests(t,s){t.actionContests=s},setActionContestsLoading(t,s){t.actionContestsLoading=s},setActionArtists(t,s){t.actionArtists=s},setActionArtistsLoading(t,s){t.actionArtistsLoading=s},setSelectedBeatmap(t,s){t.selectedBeatmap=s},setSelectedQuest(t,s){t.selectedQuest=s},setSelectedUser(t,s){t.selectedUser=s},setSelectedContest(t,s){t.selectedContest=s},setSelectedArtist(t,s){t.selectedArtist=s},updateBeatmapStatus(t,s){const e=t.actionBeatmaps.find((t=>t.id==s.beatmapId));if(e&&(e.status=s.status,e.status==U.Ranked)){const e=t.actionBeatmaps.findIndex((t=>t.id===s.beatmapId));t.actionBeatmaps.splice(e,1)}},deleteTask(t,s){const e=t.actionBeatmaps.find((t=>t.id==s.beatmapId));if(e){const t=e.tasks.findIndex((t=>t.id==s.taskId));-1!==t&&e.tasks.splice(t,1)}},deleteModder(t,s){const e=t.actionBeatmaps.find((t=>t.id==s.beatmapId));if(e){const t=e.modders.findIndex((t=>t.id==s.modderId));-1!==t&&e.modders.splice(t,1)}},updateUrl(t,s){const e=t.actionBeatmaps.find((t=>t.id==s.beatmapId));e&&(e.url=s.url)},updateStoryboardQuality(t,s){const e=t.actionBeatmaps.find((t=>t.id==s.beatmapId));if(e){const t=e.tasks.findIndex((t=>t.id==s.taskId));-1!==t&&(e.tasks[t]=s.task)}},updatePackId(t,s){const e=t.actionBeatmaps.find((t=>t.id==s.beatmapId));e&&(e.packId=s.packId)},updateIsShowcase(t,s){const e=t.actionBeatmaps.find((t=>t.id==s.beatmapId));e&&(e.isShowcase=s.isShowcase)},updateQueuedForRank(t,s){const e=t.actionBeatmaps.find((t=>t.id==s.beatmapId));e&&(e.queuedForRank=s.queuedForRank)},updateArt(t,s){const e=t.actionQuests.find((t=>t.id==s.questId));e&&(e.art=s.art)},renameQuest(t,s){const e=t.actionQuests.find((t=>t.id==s.questId));e&&(e.name=s.name)},updateDescription(t,s){const e=t.actionQuests.find((t=>t.id==s.questId));e&&(e.descriptionMain=s.description)},updateRequiredMapsets(t,s){const e=t.actionQuests.find((t=>t.id==s.questId));e&&(e.requiredMapsets=s.requiredMapsets)},updatePrice(t,s){const e=t.actionQuests.find((t=>t.id==s.questId));e&&(e.price=s.price)},updateTimeframe(t,s){const e=t.actionQuests.find((t=>t.id==s.questId));e&&(e.timeframe=864e5*s.timeframe)},updateMinParty(t,s){const e=t.actionQuests.find((t=>t.id==s.questId));e&&(e.minParty=s.minParty)},updateMaxParty(t,s){const e=t.actionQuests.find((t=>t.id==s.questId));e&&(e.maxParty=s.maxParty)},updateStatus(t,s){const e=t.actionQuests.find((t=>t.id==s.questId));if(e&&(e.status=s.status,"open"==e.status||"rejected"==e.status)){const e=t.actionQuests.findIndex((t=>t.id===s.questId));t.actionQuests.splice(e,1)}},updateQueuedForCompletion(t,s){const e=t.actionQuests.find((t=>t.id==s.questId));e&&(e.queuedForCompletion=s.queuedForCompletion)},updateGroup(t,s){const e=t.actionUsers.find((t=>t.id==s.userId));e&&(e.group=s.group)},updateBadge(t,s){const e=t.actionUsers.find((t=>t.id==s.userId));e&&(e.queuedBadge=s.badge)},updateDiscordId(t,s){const e=t.actionUsers.find((t=>t.id==s.userId));e&&(e.discordId=s.discordId)},updateIsApproved(t,s){const e=t.actionContests.find((t=>t.id==s.contestId));e&&(e.isApproved=s.isApproved)},updateIsFeaturedArtistContest(t,s){const e=t.actionContests.find((t=>t.id==s.contestId));e&&(e.isFeaturedArtistContest=s.isFeaturedArtistContest)},updateIsEligibleForPoints(t,s){const e=t.actionContests.find((t=>t.id==s.contestId));e&&(e.isFeaturedArtistContest=s.isFeaturedArtistContest)},updateNotes(t,s){const e=t.actionArtists.find((t=>t.id==s.featuredArtistId));e&&(e.notes=s.notes)},updateLastReviewed(t,s){const e=t.actionArtists.find((t=>t.id==s.featuredArtistId));e&&(e.lastReviewed=s.lastReviewed)},updatePermanentlyDismiss(t,s){const e=t.actionArtists.find((t=>t.id==s.featuredArtistId));e&&(e.permanentlyDismiss=s.permanentlyDismiss)},removeFromActionArtists(t,s){const e=t.actionArtists.findIndex((t=>t.id==s.featuredArtistId));-1!==e&&t.actionArtists.splice(e,1)}}},Yt=o({name:"AdminPage",components:{BeatmapInfoAdmin:C,QuestInfo:P,ReviewQuest:S,UserInfo:Q,ContestInfo:St,ModesIcons:L,UserLinkList:E,ArtistSearch:T,FeaturedArtistInfo:B},data:()=>({artistInput:""}),computed:((t,o)=>{for(var n in o||(o={}))e.call(o,n)&&i(t,n,o[n]);if(s)for(var n of s(o))a.call(o,n)&&i(t,n,o[n]);return t})({},A({actionBeatmaps:t=>t.admin.actionBeatmaps,actionBeatmapsLoading:t=>t.admin.actionBeatmapsLoading,actionQuests:t=>t.admin.actionQuests,actionQuestsLoading:t=>t.admin.actionQuestsLoading,actionUsers:t=>t.admin.actionUsers,actionUsersLoading:t=>t.admin.actionUsersLoading,actionContests:t=>t.admin.actionContests,actionContestsLoading:t=>t.admin.actionContestsLoading,actionArtists:t=>t.admin.actionArtists,actionArtistsLoading:t=>t.admin.actionArtistsLoading,selectedBeatmap:t=>t.admin.selectedBeatmap,selectedQuest:t=>t.admin.selectedQuest,selectedUser:t=>t.admin.selectedUser,selectedContest:t=>t.admin.selectedContest,selectedArtist:t=>t.admin.selectedArtist})),beforeCreate(){this.$store.hasModule("admin")||this.$store.registerModule("admin",Xt)},unmounted(){this.$store.hasModule("admin")&&this.$store.unregisterModule("admin")},methods:{command(t){let s;switch(t.rank){case 1:s="first";break;case 2:s="second";break;case 3:s="third";break;case 4:s="fourth"}switch(t.rank){case 0:return"";case 1:return`.add-badge ${t.osuId} mg2018-${t.rank}star.png "Mappers' Guild ${s} level contributor"`;default:return`.add-badge ${t.osuId} mg2018-${t.rank}star.png "Mappers' Guild ${s} level contributor" --replace mg2018-${t.rank-1}star.png`}},generateMetadata(t){let s=t.artist+" - ";return t.title.length>40?s+=t.title.slice(0,40)+"...":s+=t.title,s},async loadActionBeatmaps(t){{this.$store.commit("setActionBeatmaps",[]),this.$store.commit("setActionBeatmapsLoading",!0);const s=await this.$http.executeGet("/admin/loadActionBeatmaps",t);this.$http.isError(s)||this.$store.commit("setActionBeatmaps",s),this.$store.commit("setActionBeatmapsLoading",!1)}},async loadActionQuests(t){this.$store.commit("setActionQuests",[]),this.$store.commit("setActionQuestsLoading",!0);const s=await this.$http.executeGet("/admin/loadActionQuests",t);this.$http.isError(s)||this.$store.commit("setActionQuests",s),this.$store.commit("setActionQuestsLoading",!1)},async loadActionUsers(t){this.$store.commit("setActionUsers",[]),this.$store.commit("setActionUsersLoading",!0);const s=await this.$http.executeGet("/admin/loadActionUsers",t);this.$http.isError(s)||this.$store.commit("setActionUsers",s),this.$store.commit("setActionUsersLoading",!1)},async loadActionContests(t){this.$store.commit("setActionContests",[]),this.$store.commit("setActionContestsLoading",!0);const s=await this.$http.executeGet("/admin/loadActionContests",t);this.$http.isError(s)||this.$store.commit("setActionContests",s),this.$store.commit("setActionContestsLoading",!1)},async loadActionArtists(t){this.$store.commit("setActionArtists",[]),this.$store.commit("setActionArtistsLoading",!0);const s=await this.$http.executeGet("/admin/loadActionArtists",t);this.$http.isError(s)||this.$store.commit("setActionArtists",s),this.$store.commit("setActionArtistsLoading",!1)},findArtistBeatmapSearchUrl:t=>`https://osu.ppy.sh/beatmapsets?q=artist%3D"${t}"&s=any&sort=plays_desc`,async dismissArtist(t,s){const e=await this.$http.executePost(`/admin/featuredArtists/${t}/updateLastReviewed`,{},s);this.$http.isError(e)||(this.$store.dispatch("updateToastMessages",{message:"updated last reviewed",type:"info"}),this.$store.commit("removeFromActionArtists",{featuredArtistId:t}))},async permanentlyDismissArtist(t,s){const e=await this.$http.executePost(`/admin/featuredArtists/${t}/togglePermanentlyDismiss`,{},s);this.$http.isError(e)||(this.$store.dispatch("updateToastMessages",{message:`updated permanenlty dismiss: ${e}`,type:"info"}),this.$store.commit("removeFromActionArtists",{featuredArtistId:t}))}}});const Zt={class:"container card card-body py-1 mb-4"},ts={class:"row mx-3 mt-2"},ss={class:"row"},es={class:"col"},as={class:"ms-4 mt-2"},is=f("a",{href:"#actionBeatmaps","data-bs-toggle":"collapse"},[p(" Beatmaps "),f("i",{class:"fas fa-angle-down"})],-1),os={key:0,class:"ms-2 small text-secondary"},ns={id:"actionBeatmaps",class:"show"},rs={key:0,class:"table table-sm"},ds=f("thead",null,[f("tr",null,[f("th",{scope:"col"}," METADATA "),f("th",{scope:"col"}," PACK ID "),f("th",{scope:"col"}," STATUS "),f("th",{scope:"col"}," EDIT ")])],-1),cs={scope:"row"},ls=["href"],us={key:1,class:"ms-1"},ps={scope:"row"},ms={scope:"row"},hs={scope:"row"},fs=["onClick"],gs={key:1,class:"text-secondary ms-5"},ys={class:"container card card-body py-1 mb-4"},bs={class:"row mx-3 mt-2"},Is={class:"row"},As={class:"col"},ws={class:"ms-4 mt-2"},qs=f("a",{href:"#actionQuests","data-bs-toggle":"collapse"},[p(" Quests "),f("i",{class:"fas fa-angle-down"})],-1),vs={key:0,class:"ms-2 small text-secondary"},ks={id:"actionQuests",class:"show"},$s={key:0,class:"table table-sm"},Cs=f("thead",null,[f("tr",null,[f("th",{scope:"col"}," NAME "),f("th",{scope:"col"}," CREATOR "),f("th",{scope:"col"}," MODES "),f("th",{scope:"col"}," STATUS "),f("th",{scope:"col"}," MAPSETS "),f("th",{scope:"col"}," EDIT ")])],-1),Ps={scope:"row"},xs={scope:"row"},Ms={scope:"row"},Qs={scope:"row"},Bs={scope:"row"},Us={scope:"row"},Ls=["data-bs-target","onClick"],Es={key:1,class:"text-secondary ms-5"},Ts={class:"container card card-body py-1 mb-4"},Ss={class:"row mx-3 mt-2"},Fs={class:"row"},js={class:"col"},Rs={class:"ms-4 mt-2"},Ds=f("a",{href:"#actionUsers","data-bs-toggle":"collapse"},[p(" Users "),f("i",{class:"fas fa-angle-down"})],-1),Os={key:0,class:"ms-2 small text-secondary"},Ns={key:0,id:"actionUsers",class:"show"},_s={key:0,class:"table table-sm"},Gs=f("thead",null,[f("tr",null,[f("th",{scope:"col"}," USERNAME "),f("th",{scope:"col"}," RANK "),f("th",{scope:"col"}," QUEUED BADGE "),f("th",{scope:"col"}," BADGE "),f("th",{scope:"col"}," COMMAND "),f("th",{scope:"col"}," EDIT ")])],-1),zs={scope:"row"},Vs={scope:"row"},Ks={scope:"row"},Hs={class:"small"},Js={scope:"row"},Ws=["onClick"],Xs={key:1,class:"text-secondary ms-5"},Ys={class:"container card card-body py-1 mb-4"},Zs={class:"row mx-3 mt-2"},te={class:"row"},se={class:"col"},ee={class:"ms-4 mt-2"},ae=f("a",{href:"#actionContests","data-bs-toggle":"collapse"},[p(" Contests "),f("i",{class:"fas fa-angle-down"})],-1),ie={key:0,class:"ms-2 small text-secondary"},oe={key:0,id:"actionContests",class:"show"},ne={key:0,class:"table table-sm"},re=f("thead",null,[f("tr",null,[f("th",{scope:"col"}," CONTEST "),f("th",{scope:"col"}," CREATOR "),f("th",{scope:"col"}," EDIT ")])],-1),de={scope:"row"},ce=["href"],le={scope:"row"},ue={scope:"row"},pe=["onClick"],me={key:1,class:"text-secondary ms-5"},he={class:"container card card-body py-1"},fe={class:"row mx-3 mt-2"},ge={class:"row"},ye={class:"col-sm-6"},be={class:"ms-4 mt-2"},Ie=f("a",{href:"#actionArtists","data-bs-toggle":"collapse"},[p(" Artists "),f("i",{class:"fas fa-angle-down"})],-1),Ae={key:0,class:"ms-2 small text-secondary"},we={key:0,id:"actionArtists",class:"show"},qe={key:0,class:"table table-sm"},ve=f("thead",null,[f("tr",null,[f("th",{scope:"col"}," ARTIST "),f("th",{scope:"col"}," COMMENT "),f("th",{scope:"col"}," EDIT ")])],-1),ke={scope:"row"},$e=["href"],Ce=["onClick"],Pe=[f("i",{class:"fa fa-arrow-right"},null,-1)],xe=["onClick"],Me=[f("i",{class:"fas fa-times"},null,-1)],Qe=["onClick"],Be=[f("i",{class:"fas fa-times"},null,-1)],Ue={scope:"row",class:"small"},Le={key:0},Ee={scope:"row"},Te=["onClick"],Se={key:1,class:"text-secondary ms-5"},Fe=f("div",{class:"radial-divisor"},null,-1);Yt.render=function(t,s,e,a,i,o){const n=d("modes-icons"),r=d("user-link"),u=d("user-link-list"),p=d("artist-search"),I=d("beatmap-info-admin"),A=d("quest-info"),C=d("review-quest"),P=d("user-info"),x=d("contest-info"),M=d("featured-artist-info"),Q=w("bs-tooltip");return c(),y("div",null,[f("div",Zt,[f("div",ts,[f("button",{class:"btn btn-sm btn-info w-100 mb-1",onClick:s[0]||(s[0]=s=>t.loadActionBeatmaps(s))}," Load beatmaps ")]),f("div",ss,[f("div",es,[f("h5",as,[is,t.actionBeatmapsLoading?(c(),y("span",os,"loading...")):q("",!0)]),f("div",ns,[t.actionBeatmaps.length?(c(),y("table",rs,[ds,f("tbody",null,[(c(!0),y(v,null,k(t.actionBeatmaps,(s=>(c(),y("tr",{key:s.id,class:"text-secondary"},[f("td",cs,[h(n,{modes:[s.mode]},null,8,["modes"]),s.url?(c(),y("a",{key:0,href:s.url,class:"ms-1"},m(t.generateMetadata(s.song)),9,ls)):(c(),y("span",us,m(t.generateMetadata(s.song)),1))]),f("td",ps,m(s.packId),1),f("td",ms,m(s.status),1),f("td",hs,[f("a",{href:"#","data-bs-toggle":"modal","data-bs-target":"#editBeatmap",onClick:g((e=>t.$store.commit("setSelectedBeatmap",s)),["prevent"])}," edit ",8,fs)])])))),128))])])):t.actionBeatmapsLoading?q("",!0):(c(),y("span",gs,"None..."))])])])]),f("div",ys,[f("div",bs,[f("button",{class:"btn btn-sm btn-info w-100 mb-1",onClick:s[1]||(s[1]=s=>t.loadActionQuests(s))}," Load quests ")]),f("div",Is,[f("div",As,[f("h5",ws,[qs,t.actionQuestsLoading?(c(),y("span",vs,"loading...")):q("",!0)]),f("div",ks,[t.actionQuests.length?(c(),y("table",$s,[Cs,f("tbody",null,[(c(!0),y(v,null,k(t.actionQuests,(s=>(c(),y("tr",{key:s.id,class:"text-secondary"},[f("td",Ps,m(s.name),1),f("td",xs,m(s.creator.username),1),f("td",Ms,[h(n,{modes:s.modes},null,8,["modes"])]),f("td",Qs,m(s.status),1),f("td",Bs,m(s.requiredMapsets),1),f("td",Us,[f("a",{href:"#","data-bs-toggle":"modal","data-bs-target":"pending"==s.status?"#reviewQuest":"#editQuest",onClick:g((e=>t.$store.commit("setSelectedQuest",s)),["prevent"])}," edit ",8,Ls)])])))),128))])])):t.actionQuestsLoading?q("",!0):(c(),y("span",Es,"None..."))])])])]),f("div",Ts,[f("div",Ss,[f("button",{class:"btn btn-sm btn-info w-100 mb-1",onClick:s[2]||(s[2]=s=>t.loadActionUsers(s))}," Load users ")]),f("div",Fs,[f("div",js,[f("h5",Rs,[Ds,t.actionUsersLoading?(c(),y("span",Os,"loading...")):q("",!0)]),t.actionUsers?(c(),y("div",Ns,[t.actionUsers.length?(c(),y("table",_s,[Gs,f("tbody",null,[(c(!0),y(v,null,k(t.actionUsers,(s=>(c(),y("tr",{key:s.id,class:"text-secondary"},[f("td",zs,[h(r,{user:s},null,8,["user"])]),f("td",Vs,[s.rank?b((c(),y("i",{key:0,class:$(["fas fa-crown","text-rank-"+s.rank])},null,2)),[[Q,`rank ${s.rank} user`]]):q("",!0)]),f("td",{scope:"row",class:$({"bg-open":s.rank!=s.queuedBadge})},[s.queuedBadge?b((c(),y("i",{key:0,class:$(["fas fa-crown","text-rank-"+s.queuedBadge])},null,2)),[[Q,`rank ${s.queuedBadge} user`]]):q("",!0)],2),f("td",{scope:"row",class:$({"bg-open":s.rank!=s.badge})},[s.badge?b((c(),y("i",{key:0,class:$(["fas fa-crown","text-rank-"+s.badge])},null,2)),[[Q,`rank ${s.badge} user`]]):q("",!0)],2),f("td",Ks,[f("code",Hs,m(t.command(s)),1)]),f("td",Js,[f("a",{href:"#","data-bs-toggle":"modal","data-bs-target":"#editUser",onClick:g((e=>t.$store.commit("setSelectedUser",s)),["prevent"])}," edit ",8,Ws)])])))),128))])])):t.actionUsersLoading?q("",!0):(c(),y("span",Xs,"None..."))])):q("",!0)])])]),f("div",Ys,[f("div",Zs,[f("button",{class:"btn btn-sm btn-info w-100 mb-1",onClick:s[3]||(s[3]=s=>t.loadActionContests(s))}," Load contests ")]),f("div",te,[f("div",se,[f("h5",ee,[ae,t.actionContestsLoading?(c(),y("span",ie,"loading...")):q("",!0)]),t.actionContests?(c(),y("div",oe,[t.actionContests.length?(c(),y("table",ne,[re,f("tbody",null,[(c(!0),y(v,null,k(t.actionContests,(s=>(c(),y("tr",{key:s.id,class:"text-secondary"},[f("td",de,[f("a",{href:"/contests/listing?contest="+s.id},m(s.name),9,ce)]),f("td",le,[h(u,{users:s.creators},null,8,["users"])]),f("td",ue,[f("a",{href:"#","data-bs-toggle":"modal","data-bs-target":"#editContest",onClick:g((e=>t.$store.commit("setSelectedContest",s)),["prevent"])}," edit ",8,pe)])])))),128))])])):t.actionContestsLoading?q("",!0):(c(),y("span",me,"None... "))])):q("",!0)])])]),f("div",he,[f("div",fe,[f("button",{class:"btn btn-sm btn-info w-100 mb-1",onClick:s[4]||(s[4]=s=>t.loadActionArtists(s))}," Load artists ")]),f("div",ge,[f("div",ye,[f("h5",be,[Ie,t.actionArtistsLoading?(c(),y("span",Ae,"loading...")):q("",!0)]),t.actionArtists?(c(),y("div",we,[t.actionArtists.length?(c(),y("table",qe,[ve,f("tbody",null,[(c(!0),y(v,null,k(t.actionArtists,(s=>(c(),y("tr",{key:s.id,class:"text-secondary"},[f("td",ke,[f("a",{href:t.findArtistBeatmapSearchUrl(s.label),target:"_blank"},m(s.label),9,$e),f("a",{class:"ms-2",href:"#",onClick:g((e=>t.artistInput=s.label),["prevent"])},Pe,8,Ce),f("a",{class:"ms-2",href:"#",onClick:g((e=>t.dismissArtist(s.id,e)),["prevent"])},Me,8,xe),f("a",{class:"ms-2 text-danger",href:"#",onClick:g((e=>t.permanentlyDismissArtist(s.id,e)),["prevent"])},Be,8,Qe)]),f("td",Ue,[s.notes&&s.notes.length?(c(),y("div",Le,m(s.notes),1)):q("",!0)]),f("td",Ee,[f("a",{href:"#","data-bs-toggle":"modal","data-bs-target":"#editFeaturedArtist",onClick:g((e=>t.$store.commit("setSelectedArtist",s)),["prevent"])}," edit ",8,Te)])])))),128))])])):t.actionArtistsLoading?q("",!0):(c(),y("span",Se,"None... "))])):q("",!0)]),h(p,{class:"mb-2 col-sm-6",input:t.artistInput},null,8,["input"])])]),Fe,t.selectedBeatmap?(c(),l(I,{key:0,beatmap:t.selectedBeatmap},null,8,["beatmap"])):q("",!0),t.selectedQuest?(c(),l(A,{key:1,quest:t.selectedQuest},null,8,["quest"])):q("",!0),t.selectedQuest?(c(),l(C,{key:2,quest:t.selectedQuest},null,8,["quest"])):q("",!0),t.selectedUser?(c(),l(P,{key:3,user:t.selectedUser},null,8,["user"])):q("",!0),t.selectedContest?(c(),l(x,{key:4,contest:t.selectedContest},null,8,["contest"])):q("",!0),t.selectedArtist?(c(),l(M,{key:5,"featured-artist":t.selectedArtist},null,8,["featured-artist"])):q("",!0)])};export{Yt as default};