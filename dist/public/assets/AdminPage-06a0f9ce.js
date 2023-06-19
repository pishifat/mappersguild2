import{d as M,_ as Q,o as a,c as w,w as k,h as l,t as c,k as I,a as e,l as m,e as d,b as g,A as b,i as h,y as D,z as j,M as N,m as O,q as u,F as y,r as q,n as v,s as V}from"./index-8c73bd06.js";import{B as z}from"./BeatmapInfoAdmin-a6046a3c.js";import{Q as G}from"./QuestInfo-f6fe0f0c.js";import{M as U}from"./ModalDialog-a7cb74be.js";import{C as K}from"./CopyPaste-176a0ad4.js";import{U as H}from"./UserInfo-ee554ca1.js";import{F as J}from"./FeaturedArtistInfo-83971606.js";import{B as W}from"./beatmap-c2b9f550.js";import{U as X}from"./UserLinkList-2e2f20fa.js";import{A as Y}from"./ArtistSearch-a5e41bec.js";import"./AssociatedBeatmaps-d7741cdf.js";const Z=M({name:"ReviewQuest",components:{CopyPaste:K,ModalDialog:U},props:{quest:{type:Object,required:!0}},data(){return{showArtistInput:!1,artistInput:this.quest.art,showNameInput:!1,nameInput:this.quest.name,showObjectiveInput:!1,objectiveInput:this.quest.descriptionMain,showRequiredMapsetsInput:!1,requiredMapsetsInput:this.quest.requiredMapsets,showPriceInput:!1,priceInput:this.quest.price,showTimeframeInput:!1,timeframeInput:this.quest.timeframe/(24*3600*1e3),showPartySizeInput:!1,minPartyInput:this.quest.minParty,maxPartyInput:this.quest.maxParty}},watch:{quest(){this.showArtistInput=!1,this.artistInput=this.quest.art,this.showNameInput=!1,this.nameInput=this.quest.name,this.showObjectiveInput=!1,this.objectiveInput=this.quest.descriptionMain,this.showRequiredMapsetsInput=!1,this.requiredMapsetsInput=this.quest.requiredMapsets,this.showPriceInput=!1,this.priceInput=this.quest.price,this.showTimeframeInput=!1,this.timeframeInput=this.quest.timeframe/(24*3600*1e3)}},methods:{async acceptPendingQuest(t){const s=await this.$http.executePost(`/admin/quests/${this.quest.id}/schedule`,{},t);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"scheduled quest",type:"info"}),this.$store.commit("updateStatus",{questId:this.quest.id,status:s}),this.$bs.hideModal("reviewQuest"))},async rejectPendingQuest(t){const s=await this.$http.executePost(`/admin/quests/${this.quest.id}/reject`,{},t);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"rejected quest",type:"info"}),this.$store.commit("updateStatus",{questId:this.quest.id,status:s}),this.$bs.hideModal("reviewQuest"))},async updateArt(t){const s=await this.$http.executePost(`/admin/quests/${this.quest.id}/updateArt`,{art:this.artistInput},t);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"updated artist",type:"info"}),this.$store.commit("updateArt",{questId:this.quest.id,art:s}),this.showArtistInput=!1)},async renameQuest(t){const s=await this.$http.executePost(`/admin/quests/${this.quest.id}/rename`,{name:this.nameInput},t);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"renamed quest",type:"info"}),this.$store.commit("renameQuest",{questId:this.quest.id,name:s}),this.showNameInput=!1)},async updateDescription(t){const s=await this.$http.executePost(`/admin/quests/${this.quest.id}/updateDescription/`,{description:this.objectiveInput},t);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"updated quest description",type:"info"}),this.$store.commit("updateDescription",{questId:this.quest.id,description:s}),this.showObjectiveInput=!1)},async updateRequiredMapsets(t){const s=await this.$http.executePost(`/admin/quests/${this.quest.id}/updateRequiredMapsets`,{requiredMapsets:this.requiredMapsetsInput},t);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"updated required mapsets",type:"info"}),this.$store.commit("updateRequiredMapsets",{questId:this.quest.id,requiredMapsets:s}),this.showRequiredMapsetsInput=!1)},async updatePrice(t){const s=await this.$http.executePost(`/admin/quests/${this.quest.id}/updatePrice`,{price:this.priceInput},t);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"updated price",type:"info"}),this.$store.commit("updatePrice",{questId:this.quest.id,price:s}),this.showPriceInput=!1)},async updateTimeframe(t){const s=await this.$http.executePost(`/admin/quests/${this.quest.id}/updateTimeframe`,{timeframe:this.timeframeInput},t);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"updated timeframe",type:"info"}),this.$store.commit("updateTimeframe",{questId:this.quest.id,timeframe:s}),this.showTimeframeInput=!1)},async updateMinParty(t){const s=await this.$http.executePost(`/admin/quests/${this.quest.id}/updateMinParty`,{minParty:this.minPartyInput},t);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"updated minParty",type:"info"}),this.$store.commit("updateMinParty",{questId:this.quest.id,minParty:s}),this.showPartySizeInput=!1)},async updateMaxParty(t){const s=await this.$http.executePost(`/admin/quests/${this.quest.id}/updateMaxParty`,{maxParty:this.maxPartyInput},t);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"updated maxParty",type:"info"}),this.$store.commit("updateMaxParty",{questId:this.quest.id,maxParty:s}),this.showPartySizeInput=!1)}}});const p=t=>(D("data-v-eec952e6"),t=t(),j(),t),x={class:"container"},tt={class:"small text-white-50"},st=p(()=>e("i",{class:"fas fa-edit"},null,-1)),et=[st],ot={key:0},it={key:1,class:"ms-2"},nt=["href"],at=["src"],dt={key:2,class:"ms-2"},rt={class:"small text-white-50"},ct=p(()=>e("i",{class:"fas fa-edit"},null,-1)),ut=[ct],lt={key:3},pt={key:4,class:"ms-2"},mt={class:"small text-white-50"},ht=p(()=>e("i",{class:"fas fa-edit"},null,-1)),ft=[ht],gt={key:5},$t={key:6,class:"ms-2"},_t={class:"small text-white-50"},bt=p(()=>e("i",{class:"fas fa-edit"},null,-1)),wt=[bt],It={key:7},At={key:8,class:"ms-2"},yt={class:"small text-white-50"},qt=p(()=>e("i",{class:"fas fa-edit"},null,-1)),vt=[qt],kt={key:9},Ct={key:10,class:"ms-2"},Pt={class:"small text-white-50"},Mt=p(()=>e("i",{class:"fas fa-edit"},null,-1)),Qt=[Mt],Bt={key:11},Ut={key:12,class:"ms-2"},Lt={class:"small text-white-50"},Tt=p(()=>e("i",{class:"fas fa-edit"},null,-1)),Et=[Tt],St={key:13},Ft={key:14,class:"ms-2"},Rt=p(()=>e("div",{class:"small text-white-50"}," Party rank ",-1)),Dt={class:"ms-2"},jt=p(()=>e("div",{class:"small text-white-50"}," MBC ",-1)),Nt={class:"ms-2"},Ot=p(()=>e("div",{class:"radial-divisor"},null,-1)),Vt=p(()=>e("button",{class:"btn btn-outline-secondary w-100","data-bs-toggle":"collapse","data-bs-target":"#forumPm"},[l(" See rejection message "),e("i",{class:"fas fa-angle-down"})],-1)),zt={id:"forumPm",class:"collapse"},Gt=p(()=>e("div",null,"hello, you're receiving this message because you submitted a Mappers' Guild quest for review",-1)),Kt=p(()=>e("div",null,"[box=your quest info]",-1)),Ht=p(()=>e("div",null,"[/box]",-1)),Jt=p(()=>e("div",null,"your quest has been rejected for the following reason(s):",-1)),Wt=p(()=>e("div",null,"[notice] REASONS [/notice]",-1)),Xt=p(()=>e("div",null,`points spent for submitting the quest have been returned to your "available points" pool. if you'd like to modify the quest according to above feedback, you can resubmit it and i'll review it again! or if you'd like to submit any other quest, that's fine too!`,-1)),Yt=p(()=>e("div",null,"thanks for being cool",-1));function Zt(t,s,o,i,f,B){const A=h("user-link"),$=h("copy-paste"),C=h("modal-dialog");return a(),w(C,{id:"reviewQuest",loaded:Boolean(t.quest)},{header:k(()=>[l(c(t.quest.name)+" by ",1),I(A,{class:"text-dark",user:t.quest.creator},null,8,["user"])]),default:k(()=>[e("div",x,[e("div",tt,[l(" Artist "),e("a",{href:"#",onClick:s[0]||(s[0]=m(r=>t.showArtistInput=!t.showArtistInput,["prevent"]))},et)]),t.showArtistInput?(a(),d("p",ot,[g(e("input",{"onUpdate:modelValue":s[1]||(s[1]=r=>t.artistInput=r),class:"form-control form-control-sm w-100",type:"number",autocomplete:"off",placeholder:"artist ID...",onChange:s[2]||(s[2]=r=>t.updateArt(r))},null,544),[[b,t.artistInput,void 0,{number:!0}]])])):t.quest.art?(a(),d("p",it,[e("a",{href:"https://osu.ppy.sh/beatmaps/artists/"+t.quest.art,target:"_blank"},[e("img",{src:"https://assets.ppy.sh/artists/"+t.quest.art+"/cover.jpg",class:"card-avatar-img"},null,8,at)],8,nt)])):(a(),d("p",dt," None ")),e("div",rt,[l(" Name "),e("a",{href:"#",onClick:s[3]||(s[3]=m(r=>t.showNameInput=!t.showNameInput,["prevent"]))},ut)]),t.showNameInput?(a(),d("p",lt,[g(e("input",{"onUpdate:modelValue":s[4]||(s[4]=r=>t.nameInput=r),class:"form-control form-control-sm w-100",type:"text",autocomplete:"off",placeholder:"name...",onChange:s[5]||(s[5]=r=>t.renameQuest(r))},null,544),[[b,t.nameInput]])])):(a(),d("p",pt,c(t.quest.name),1)),e("div",mt,[l(" Objective "),e("a",{href:"#",onClick:s[6]||(s[6]=m(r=>t.showObjectiveInput=!t.showObjectiveInput,["prevent"]))},ft)]),t.showObjectiveInput?(a(),d("p",gt,[g(e("textarea",{"onUpdate:modelValue":s[7]||(s[7]=r=>t.objectiveInput=r),class:"form-control form-control-sm w-100",rows:"2",type:"text",autocomplete:"off",placeholder:"objective...",onChange:s[8]||(s[8]=r=>t.updateDescription(r))},null,544),[[b,t.objectiveInput]])])):(a(),d("p",$t,c(t.quest.descriptionMain),1)),e("div",_t,[l(" Required mapsets "),e("a",{href:"#",onClick:s[9]||(s[9]=m(r=>t.showRequiredMapsetsInput=!t.showRequiredMapsetsInput,["prevent"]))},wt)]),t.showRequiredMapsetsInput?(a(),d("p",It,[g(e("input",{"onUpdate:modelValue":s[10]||(s[10]=r=>t.requiredMapsetsInput=r),class:"form-control form-control-sm w-100",type:"number",autocomplete:"off",placeholder:"required mapsets...",onChange:s[11]||(s[11]=r=>t.updateRequiredMapsets(r))},null,544),[[b,t.requiredMapsetsInput,void 0,{number:!0}]])])):(a(),d("p",At,c(t.quest.requiredMapsets),1)),e("div",yt,[l(" Price "),e("a",{href:"#",onClick:s[12]||(s[12]=m(r=>t.showPriceInput=!t.showPriceInput,["prevent"]))},vt)]),t.showPriceInput?(a(),d("p",kt,[g(e("input",{"onUpdate:modelValue":s[13]||(s[13]=r=>t.priceInput=r),class:"form-control form-control-sm w-100",type:"number",autocomplete:"off",placeholder:"price per party member...",onChange:s[14]||(s[14]=r=>t.updatePrice(r))},null,544),[[b,t.priceInput,void 0,{number:!0}]])])):(a(),d("p",Ct,c(t.quest.price)+" points per user ",1)),e("div",Pt,[l(" Timeframe "),e("a",{href:"#",onClick:s[15]||(s[15]=m(r=>t.showTimeframeInput=!t.showTimeframeInput,["prevent"]))},Qt)]),t.showTimeframeInput?(a(),d("p",Bt,[g(e("input",{"onUpdate:modelValue":s[16]||(s[16]=r=>t.timeframeInput=r),class:"form-control form-control-sm w-100",type:"number",autocomplete:"off",placeholder:"days...",onChange:s[17]||(s[17]=r=>t.updateTimeframe(r))},null,544),[[b,t.timeframeInput,void 0,{number:!0}]])])):(a(),d("p",Ut,c(t.quest.timeframe/(24*3600*1e3))+" days ",1)),e("div",Lt,[l(" Party size "),e("a",{href:"#",onClick:s[18]||(s[18]=m(r=>t.showPartySizeInput=!t.showPartySizeInput,["prevent"]))},Et)]),t.showPartySizeInput?(a(),d("p",St,[g(e("input",{"onUpdate:modelValue":s[19]||(s[19]=r=>t.minPartyInput=r),class:"form-control form-control-sm w-100",type:"number",autocomplete:"off",placeholder:"minimum",onChange:s[20]||(s[20]=r=>t.updateMinParty(r))},null,544),[[b,t.minPartyInput,void 0,{number:!0}]]),g(e("input",{"onUpdate:modelValue":s[21]||(s[21]=r=>t.maxPartyInput=r),class:"form-control form-control-sm w-100",type:"number",autocomplete:"off",placeholder:"maximum",onChange:s[22]||(s[22]=r=>t.updateMaxParty(r))},null,544),[[b,t.maxPartyInput,void 0,{number:!0}]])])):(a(),d("p",Ft,c(t.quest.minParty)+"-"+c(t.quest.maxParty)+" members ",1)),Rt,e("p",Dt,c(t.quest.minRank)+" rank required ",1),jt,e("p",Nt,c(t.quest.isMbc?"yes":"no"),1),Ot,e("button",{type:"submit",class:"btn btn-outline-success w-100",onClick:s[23]||(s[23]=r=>t.acceptPendingQuest(r))}," Schedule quest "),e("button",{type:"submit",class:"btn btn-outline-danger w-100",onClick:s[24]||(s[24]=r=>t.rejectPendingQuest(r))}," Reject quest "),Vt,e("div",zt,[I($,null,{default:k(()=>[Gt,Kt,e("div",null,"Artist: "+c("https://osu.ppy.sh/beatmaps/artists/"+t.quest.art),1),e("div",null,"Name: "+c(t.quest.name),1),e("div",null,"Objective: "+c(t.quest.descriptionMain),1),e("div",null,"Required mapsets: "+c(t.quest.requiredMapsets),1),e("div",null,"Price: "+c(t.quest.price)+" points per user",1),e("div",null,"Timeframe: "+c(t.quest.timeframe/(24*3600*1e3))+" days",1),e("div",null,"Party size: "+c(t.quest.minParty)+"-"+c(t.quest.maxParty)+" members",1),Ht,Jt,Wt,Xt,Yt]),_:1})])])]),_:1},8,["loaded"])}const xt=Q(Z,[["render",Zt],["__scopeId","data-v-eec952e6"]]),ts=M({name:"ContestInfo",components:{ModalDialog:U},props:{contest:{type:Object,default:null}},methods:{async toggleIsApproved(t){const s=await this.$http.executePost(`/admin/contests/${this.contest.id}/toggleIsApproved`,{isApproved:!this.contest.isApproved},t);s&&(this.$store.dispatch("updateToastMessages",{message:`set isApproved to ${s.isApproved}`,type:"info"}),this.$store.commit("updateIsApproved",{contestId:this.contest.id,isApproved:s.isApproved}))},async toggleIsFeaturedArtistContest(t){const s=await this.$http.executePost(`/admin/contests/${this.contest.id}/toggleIsFeaturedArtistContest`,{isFeaturedArtistContest:!this.contest.isFeaturedArtistContest},t);s&&(this.$store.dispatch("updateToastMessages",{message:`set isFeaturedArtistContest to ${s.isFeaturedArtistContest}`,type:"info"}),this.$store.commit("updateIsFeaturedArtistContest",{contestId:this.contest.id,isFeaturedArtistContest:s.isFeaturedArtistContest}))},async toggleIsEligibleForPoints(t){const s=await this.$http.executePost(`/admin/contests/${this.contest.id}/toggleIsEligibleForPoints`,{isEligibleForPoints:!this.contest.isEligibleForPoints},t);s&&(this.$store.dispatch("updateToastMessages",{message:`set isEligibleForPoints to ${s.isEligibleForPoints}`,type:"info"}),this.$store.commit("updateIsEligibleForPoints",{contestId:this.contest.id,isEligibleForPoints:s.isEligibleForPoints}))}}}),ss={class:"container"},es={class:"row"},os={class:"col-sm-6"},is={class:"text-danger me-2"},ns={class:"row"},as={class:"col-sm-6"},ds={class:"text-danger me-2"},rs=e("hr",null,null,-1),cs={class:"row"},us={class:"col-sm-6"},ls={class:"text-danger me-2"};function ps(t,s,o,i,f,B){const A=h("modal-dialog");return a(),w(A,{id:"editContest",loaded:Boolean(t.contest)},{header:k(()=>[l(c(t.contest.name),1)]),default:k(()=>[e("div",ss,[e("p",es,[e("span",os,[l(" Featured Artist contest: "),e("span",is,c(t.contest.isFeaturedArtistContest?"true":"false"),1)]),e("button",{class:"btn btn-sm btn-outline-info ms-3 w-25",onClick:s[0]||(s[0]=$=>t.toggleIsFeaturedArtistContest($))}," Toggle ")]),e("p",ns,[e("span",as,[l(" Eligible for points: "),e("span",ds,c(t.contest.isEligibleForPoints?"true":"false"),1)]),e("button",{class:"btn btn-sm btn-outline-info ms-3 w-25",onClick:s[1]||(s[1]=$=>t.toggleIsEligibleForPoints($))}," Toggle ")]),rs,e("p",cs,[e("span",us,[l(" Publicly visible: "),e("span",ls,c(t.contest.isApproved?"true":"false"),1)]),e("button",{class:"btn btn-sm btn-outline-info ms-3 w-25",onClick:s[2]||(s[2]=$=>t.toggleIsApproved($))}," Toggle ")])])]),_:1},8,["loaded"])}const ms=Q(ts,[["render",ps]]),hs={state:{actionBeatmaps:[],actionBeatmapsLoading:!1,actionQuests:[],actionQuestsLoading:!1,actionUsers:[],actionUsersLoading:!1,actionContests:[],actionContestsLoading:!1,actionArtists:[],actionArtistsLoading:!1,selectedBeatmap:null,selectedQuest:null,selectedUser:null,selectedContest:null,selectedArtist:null},mutations:{setActionBeatmaps(t,s){t.actionBeatmaps=s},setActionBeatmapsLoading(t,s){t.actionBeatmapsLoading=s},setActionQuests(t,s){t.actionQuests=s},setActionQuestsLoading(t,s){t.actionQuestsLoading=s},setActionUsers(t,s){t.actionUsers=s},setActionUsersLoading(t,s){t.actionUsersLoading=s},setActionContests(t,s){t.actionContests=s},setActionContestsLoading(t,s){t.actionContestsLoading=s},setActionArtists(t,s){t.actionArtists=s},setActionArtistsLoading(t,s){t.actionArtistsLoading=s},setSelectedBeatmap(t,s){t.selectedBeatmap=s},setSelectedQuest(t,s){t.selectedQuest=s},setSelectedUser(t,s){t.selectedUser=s},setSelectedContest(t,s){t.selectedContest=s},setSelectedArtist(t,s){t.selectedArtist=s},updateBeatmapStatus(t,s){const o=t.actionBeatmaps.find(i=>i.id==s.beatmapId);if(o&&(o.status=s.status,o.status==W.Ranked)){const i=t.actionBeatmaps.findIndex(f=>f.id===s.beatmapId);t.actionBeatmaps.splice(i,1)}},deleteTask(t,s){const o=t.actionBeatmaps.find(i=>i.id==s.beatmapId);if(o){const i=o.tasks.findIndex(f=>f.id==s.taskId);i!==-1&&o.tasks.splice(i,1)}},deleteModder(t,s){const o=t.actionBeatmaps.find(i=>i.id==s.beatmapId);if(o){const i=o.modders.findIndex(f=>f.id==s.modderId);i!==-1&&o.modders.splice(i,1)}},updateUrl(t,s){const o=t.actionBeatmaps.find(i=>i.id==s.beatmapId);o&&(o.url=s.url)},updateStoryboardQuality(t,s){const o=t.actionBeatmaps.find(i=>i.id==s.beatmapId);if(o){const i=o.tasks.findIndex(f=>f.id==s.taskId);i!==-1&&(o.tasks[i]=s.task)}},updatePackId(t,s){const o=t.actionBeatmaps.find(i=>i.id==s.beatmapId);o&&(o.packId=s.packId)},updateIsShowcase(t,s){const o=t.actionBeatmaps.find(i=>i.id==s.beatmapId);o&&(o.isShowcase=s.isShowcase)},updateQueuedForRank(t,s){const o=t.actionBeatmaps.find(i=>i.id==s.beatmapId);o&&(o.queuedForRank=s.queuedForRank)},updateArt(t,s){const o=t.actionQuests.find(i=>i.id==s.questId);o&&(o.art=s.art)},renameQuest(t,s){const o=t.actionQuests.find(i=>i.id==s.questId);o&&(o.name=s.name)},updateDescription(t,s){const o=t.actionQuests.find(i=>i.id==s.questId);o&&(o.descriptionMain=s.description)},updateRequiredMapsets(t,s){const o=t.actionQuests.find(i=>i.id==s.questId);o&&(o.requiredMapsets=s.requiredMapsets)},updatePrice(t,s){const o=t.actionQuests.find(i=>i.id==s.questId);o&&(o.price=s.price)},updateTimeframe(t,s){const o=t.actionQuests.find(i=>i.id==s.questId);o&&(o.timeframe=s.timeframe*(24*3600*1e3))},updateMinParty(t,s){const o=t.actionQuests.find(i=>i.id==s.questId);o&&(o.minParty=s.minParty)},updateMaxParty(t,s){const o=t.actionQuests.find(i=>i.id==s.questId);o&&(o.maxParty=s.maxParty)},updateStatus(t,s){const o=t.actionQuests.find(i=>i.id==s.questId);if(o&&(o.status=s.status,o.status=="open"||o.status=="rejected")){const i=t.actionQuests.findIndex(f=>f.id===s.questId);t.actionQuests.splice(i,1)}},updateQueuedForCompletion(t,s){const o=t.actionQuests.find(i=>i.id==s.questId);o&&(o.queuedForCompletion=s.queuedForCompletion)},updateGroup(t,s){const o=t.actionUsers.find(i=>i.id==s.userId);o&&(o.group=s.group)},updateBadge(t,s){const o=t.actionUsers.find(i=>i.id==s.userId);o&&(o.queuedBadge=s.badge)},updateDiscordId(t,s){const o=t.actionUsers.find(i=>i.id==s.userId);o&&(o.discordId=s.discordId)},updateBypassLogin(t,s){const o=t.actionUsers.find(i=>i.id==s.userId);o&&(o.bypassLogin=s.bypassLogin)},updateIsApproved(t,s){const o=t.actionContests.find(i=>i.id==s.contestId);o&&(o.isApproved=s.isApproved)},updateIsFeaturedArtistContest(t,s){const o=t.actionContests.find(i=>i.id==s.contestId);o&&(o.isFeaturedArtistContest=s.isFeaturedArtistContest)},updateIsEligibleForPoints(t,s){const o=t.actionContests.find(i=>i.id==s.contestId);o&&(o.isFeaturedArtistContest=s.isFeaturedArtistContest)},updateNotes(t,s){const o=t.actionArtists.find(i=>i.id==s.featuredArtistId);o&&(o.notes=s.notes)},updateLastReviewed(t,s){const o=t.actionArtists.find(i=>i.id==s.featuredArtistId);o&&(o.lastReviewed=s.lastReviewed)},updatePermanentlyDismiss(t,s){const o=t.actionArtists.find(i=>i.id==s.featuredArtistId);o&&(o.permanentlyDismiss=s.permanentlyDismiss)},removeFromActionArtists(t,s){const o=t.actionArtists.findIndex(i=>i.id==s.featuredArtistId);o!==-1&&t.actionArtists.splice(o,1)}}},fs=hs,gs=M({name:"AdminPage",components:{BeatmapInfoAdmin:z,QuestInfo:G,ReviewQuest:xt,UserInfo:H,ContestInfo:ms,ModesIcons:N,UserLinkList:X,ArtistSearch:Y,FeaturedArtistInfo:J},data(){return{artistInput:""}},computed:O({actionBeatmaps:t=>t.admin.actionBeatmaps,actionBeatmapsLoading:t=>t.admin.actionBeatmapsLoading,actionQuests:t=>t.admin.actionQuests,actionQuestsLoading:t=>t.admin.actionQuestsLoading,actionUsers:t=>t.admin.actionUsers,actionUsersLoading:t=>t.admin.actionUsersLoading,actionContests:t=>t.admin.actionContests,actionContestsLoading:t=>t.admin.actionContestsLoading,actionArtists:t=>t.admin.actionArtists,actionArtistsLoading:t=>t.admin.actionArtistsLoading,selectedBeatmap:t=>t.admin.selectedBeatmap,selectedQuest:t=>t.admin.selectedQuest,selectedUser:t=>t.admin.selectedUser,selectedContest:t=>t.admin.selectedContest,selectedArtist:t=>t.admin.selectedArtist}),beforeCreate(){this.$store.hasModule("admin")||this.$store.registerModule("admin",fs)},unmounted(){this.$store.hasModule("admin")&&this.$store.unregisterModule("admin")},methods:{generateMetadata(t){let s=t.artist+" - ";return t.title.length>40?s+=t.title.slice(0,40)+"...":s+=t.title,s},async loadActionBeatmaps(t){{this.$store.commit("setActionBeatmaps",[]),this.$store.commit("setActionBeatmapsLoading",!0);const s=await this.$http.executeGet("/admin/loadActionBeatmaps",t);this.$http.isError(s)||this.$store.commit("setActionBeatmaps",s),this.$store.commit("setActionBeatmapsLoading",!1)}},async loadActionQuests(t){this.$store.commit("setActionQuests",[]),this.$store.commit("setActionQuestsLoading",!0);const s=await this.$http.executeGet("/admin/loadActionQuests",t);this.$http.isError(s)||this.$store.commit("setActionQuests",s),this.$store.commit("setActionQuestsLoading",!1)},async loadActionUsers(t){this.$store.commit("setActionUsers",[]),this.$store.commit("setActionUsersLoading",!0);const s=await this.$http.executeGet("/admin/loadActionUsers",t);this.$http.isError(s)||this.$store.commit("setActionUsers",s),this.$store.commit("setActionUsersLoading",!1)},async loadActionContests(t){this.$store.commit("setActionContests",[]),this.$store.commit("setActionContestsLoading",!0);const s=await this.$http.executeGet("/admin/loadActionContests",t);this.$http.isError(s)||this.$store.commit("setActionContests",s),this.$store.commit("setActionContestsLoading",!1)},async loadActionArtists(t){this.$store.commit("setActionArtists",[]),this.$store.commit("setActionArtistsLoading",!0);const s=await this.$http.executeGet("/admin/loadActionArtists",t);this.$http.isError(s)||this.$store.commit("setActionArtists",s),this.$store.commit("setActionArtistsLoading",!1)},findArtistBeatmapSearchUrl(t){return`https://osu.ppy.sh/beatmapsets?q=artist%3D"${t}"&s=any&sort=plays_desc`},async dismissArtist(t,s){const o=await this.$http.executePost(`/admin/featuredArtists/${t}/updateLastReviewed`,{},s);this.$http.isError(o)||(this.$store.dispatch("updateToastMessages",{message:"updated last reviewed",type:"info"}),this.$store.commit("removeFromActionArtists",{featuredArtistId:t}))},async permanentlyDismissArtist(t,s){const o=await this.$http.executePost(`/admin/featuredArtists/${t}/togglePermanentlyDismiss`,{},s);this.$http.isError(o)||(this.$store.dispatch("updateToastMessages",{message:`updated permanenlty dismiss: ${o}`,type:"info"}),this.$store.commit("removeFromActionArtists",{featuredArtistId:t}))}}}),$s={class:"container card card-body py-1 mb-4"},_s={class:"row mx-3 mt-2"},bs={class:"row"},ws={class:"col"},Is={class:"ms-4 mt-2"},As=e("a",{href:"#actionBeatmaps","data-bs-toggle":"collapse"},[l(" Beatmaps "),e("i",{class:"fas fa-angle-down"})],-1),ys={key:0,class:"ms-2 small text-white-50"},qs={id:"actionBeatmaps",class:"show"},vs={key:0,class:"table table-sm"},ks=e("thead",null,[e("tr",null,[e("th",{scope:"col"}," METADATA "),e("th",{scope:"col"}," PACK ID "),e("th",{scope:"col"}," STATUS "),e("th",{scope:"col"}," EDIT ")])],-1),Cs={scope:"row"},Ps=["href"],Ms={key:1,class:"ms-1"},Qs={scope:"row"},Bs={scope:"row"},Us={scope:"row"},Ls=["onClick"],Ts={key:1,class:"text-white-50 ms-5"},Es={class:"container card card-body py-1 mb-4"},Ss={class:"row mx-3 mt-2"},Fs={class:"row"},Rs={class:"col"},Ds={class:"ms-4 mt-2"},js=e("a",{href:"#actionQuests","data-bs-toggle":"collapse"},[l(" Quests "),e("i",{class:"fas fa-angle-down"})],-1),Ns={key:0,class:"ms-2 small text-white-50"},Os={id:"actionQuests",class:"show"},Vs={key:0,class:"table table-sm"},zs=e("thead",null,[e("tr",null,[e("th",{scope:"col"}," NAME "),e("th",{scope:"col"}," CREATOR "),e("th",{scope:"col"}," MODES "),e("th",{scope:"col"}," STATUS "),e("th",{scope:"col"}," MAPSETS "),e("th",{scope:"col"}," EDIT ")])],-1),Gs={scope:"row"},Ks={scope:"row"},Hs={scope:"row"},Js={scope:"row"},Ws={scope:"row"},Xs={scope:"row"},Ys=["data-bs-target","onClick"],Zs={key:1,class:"text-white-50 ms-5"},xs={class:"container card card-body py-1 mb-4"},te={class:"row mx-3 mt-2"},se={class:"row"},ee={class:"col"},oe={class:"ms-4 mt-2"},ie=e("a",{href:"#actionUsers","data-bs-toggle":"collapse"},[l(" Users "),e("i",{class:"fas fa-angle-down"})],-1),ne={key:0,class:"ms-2 small text-white-50"},ae={key:0,id:"actionUsers",class:"show"},de={key:0,class:"table table-sm"},re=e("thead",null,[e("tr",null,[e("th",{scope:"col"}," USERNAME "),e("th",{scope:"col"}," RANK "),e("th",{scope:"col"}," QUEUED BADGE "),e("th",{scope:"col"}," BADGE "),e("th",{scope:"col"}," EDIT ")])],-1),ce={scope:"row"},ue={scope:"row"},le={scope:"row"},pe=["onClick"],me={key:1,class:"text-white-50 ms-5"},he={class:"container card card-body py-1 mb-4"},fe={class:"row mx-3 mt-2"},ge={class:"row"},$e={class:"col"},_e={class:"ms-4 mt-2"},be=e("a",{href:"#actionContests","data-bs-toggle":"collapse"},[l(" Contests "),e("i",{class:"fas fa-angle-down"})],-1),we={key:0,class:"ms-2 small text-white-50"},Ie={key:0,id:"actionContests",class:"show"},Ae={key:0,class:"table table-sm"},ye=e("thead",null,[e("tr",null,[e("th",{scope:"col"}," CONTEST "),e("th",{scope:"col"}," CREATOR "),e("th",{scope:"col"}," EDIT ")])],-1),qe={scope:"row"},ve=["href"],ke={scope:"row"},Ce={scope:"row"},Pe=["onClick"],Me={key:1,class:"text-white-50 ms-5"},Qe={class:"container card card-body py-1"},Be={class:"row mx-3 mt-2"},Ue={class:"row"},Le={class:"col-sm-6"},Te={class:"ms-4 mt-2"},Ee=e("a",{href:"#actionArtists","data-bs-toggle":"collapse"},[l(" Artists "),e("i",{class:"fas fa-angle-down"})],-1),Se={key:0,class:"ms-2 small text-white-50"},Fe={key:0,id:"actionArtists",class:"show"},Re={key:0,class:"table table-sm"},De=e("thead",null,[e("tr",null,[e("th",{scope:"col"}," ARTIST "),e("th",{scope:"col"}," COMMENT "),e("th",{scope:"col"}," EDIT ")])],-1),je={scope:"row"},Ne=["href"],Oe=["onClick"],Ve=e("i",{class:"fa fa-arrow-right"},null,-1),ze=[Ve],Ge=["onClick"],Ke=e("i",{class:"fas fa-times"},null,-1),He=[Ke],Je=["onClick"],We=e("i",{class:"fas fa-times"},null,-1),Xe=[We],Ye={scope:"row",class:"small"},Ze={key:0},xe={scope:"row"},to=["onClick"],so={key:1,class:"text-white-50 ms-5"},eo=e("div",{class:"radial-divisor"},null,-1);function oo(t,s,o,i,f,B){const A=h("modes-icons"),$=h("user-link"),C=h("user-link-list"),r=h("artist-search"),L=h("beatmap-info-admin"),T=h("quest-info"),E=h("review-quest"),S=h("user-info"),F=h("contest-info"),R=h("featured-artist-info"),P=V("bs-tooltip");return a(),d("div",null,[e("div",$s,[e("div",_s,[e("button",{class:"btn btn-sm btn-info w-100 mb-1",onClick:s[0]||(s[0]=n=>t.loadActionBeatmaps(n))}," Load beatmaps ")]),e("div",bs,[e("div",ws,[e("h5",Is,[As,t.actionBeatmapsLoading?(a(),d("span",ys,"loading...")):u("",!0)]),e("div",qs,[t.actionBeatmaps.length?(a(),d("table",vs,[ks,e("tbody",null,[(a(!0),d(y,null,q(t.actionBeatmaps,n=>(a(),d("tr",{key:n.id,class:"text-white-50"},[e("td",Cs,[I(A,{modes:[n.mode]},null,8,["modes"]),n.url?(a(),d("a",{key:0,href:n.url,class:"ms-1"},c(t.generateMetadata(n.song)),9,Ps)):(a(),d("span",Ms,c(t.generateMetadata(n.song)),1))]),e("td",Qs,c(n.packId),1),e("td",Bs,c(n.status),1),e("td",Us,[e("a",{href:"#","data-bs-toggle":"modal","data-bs-target":"#editBeatmap",onClick:m(_=>t.$store.commit("setSelectedBeatmap",n),["prevent"])}," edit ",8,Ls)])]))),128))])])):t.actionBeatmapsLoading?u("",!0):(a(),d("span",Ts,"None..."))])])])]),e("div",Es,[e("div",Ss,[e("button",{class:"btn btn-sm btn-info w-100 mb-1",onClick:s[1]||(s[1]=n=>t.loadActionQuests(n))}," Load quests ")]),e("div",Fs,[e("div",Rs,[e("h5",Ds,[js,t.actionQuestsLoading?(a(),d("span",Ns,"loading...")):u("",!0)]),e("div",Os,[t.actionQuests.length?(a(),d("table",Vs,[zs,e("tbody",null,[(a(!0),d(y,null,q(t.actionQuests,n=>(a(),d("tr",{key:n.id,class:"text-white-50"},[e("td",Gs,c(n.name),1),e("td",Ks,c(n.creator.username),1),e("td",Hs,[I(A,{modes:n.modes},null,8,["modes"])]),e("td",Js,c(n.status),1),e("td",Ws,c(n.requiredMapsets),1),e("td",Xs,[e("a",{href:"#","data-bs-toggle":"modal","data-bs-target":n.status=="pending"?"#reviewQuest":"#editQuest",onClick:m(_=>t.$store.commit("setSelectedQuest",n),["prevent"])}," edit ",8,Ys)])]))),128))])])):t.actionQuestsLoading?u("",!0):(a(),d("span",Zs,"None..."))])])])]),e("div",xs,[e("div",te,[e("button",{class:"btn btn-sm btn-info w-100 mb-1",onClick:s[2]||(s[2]=n=>t.loadActionUsers(n))}," Load users ")]),e("div",se,[e("div",ee,[e("h5",oe,[ie,t.actionUsersLoading?(a(),d("span",ne,"loading...")):u("",!0)]),t.actionUsers?(a(),d("div",ae,[t.actionUsers.length?(a(),d("table",de,[re,e("tbody",null,[(a(!0),d(y,null,q(t.actionUsers,n=>(a(),d("tr",{key:n.id,class:"text-white-50"},[e("td",ce,[I($,{user:n},null,8,["user"])]),e("td",ue,[n.rank?g((a(),d("i",{key:0,class:v(["fas fa-crown","text-rank-"+n.rank])},null,2)),[[P,`rank ${n.rank} user`]]):u("",!0)]),e("td",{scope:"row",class:v({"bg-open":n.rank!=n.queuedBadge})},[n.queuedBadge?g((a(),d("i",{key:0,class:v(["fas fa-crown","text-rank-"+n.queuedBadge])},null,2)),[[P,`rank ${n.queuedBadge} user`]]):u("",!0)],2),e("td",{scope:"row",class:v({"bg-open":n.rank!=n.badge})},[n.badge?g((a(),d("i",{key:0,class:v(["fas fa-crown","text-rank-"+n.badge])},null,2)),[[P,`rank ${n.badge} user`]]):u("",!0)],2),e("td",le,[e("a",{href:"#","data-bs-toggle":"modal","data-bs-target":"#editUser",onClick:m(_=>t.$store.commit("setSelectedUser",n),["prevent"])}," edit ",8,pe)])]))),128))])])):t.actionUsersLoading?u("",!0):(a(),d("span",me,"None..."))])):u("",!0)])])]),e("div",he,[e("div",fe,[e("button",{class:"btn btn-sm btn-info w-100 mb-1",onClick:s[3]||(s[3]=n=>t.loadActionContests(n))}," Load contests ")]),e("div",ge,[e("div",$e,[e("h5",_e,[be,t.actionContestsLoading?(a(),d("span",we,"loading...")):u("",!0)]),t.actionContests?(a(),d("div",Ie,[t.actionContests.length?(a(),d("table",Ae,[ye,e("tbody",null,[(a(!0),d(y,null,q(t.actionContests,n=>(a(),d("tr",{key:n.id,class:"text-white-50"},[e("td",qe,[e("a",{href:"/contests/listing?contest="+n.id},c(n.name),9,ve)]),e("td",ke,[I(C,{users:n.creators},null,8,["users"])]),e("td",Ce,[e("a",{href:"#","data-bs-toggle":"modal","data-bs-target":"#editContest",onClick:m(_=>t.$store.commit("setSelectedContest",n),["prevent"])}," edit ",8,Pe)])]))),128))])])):t.actionContestsLoading?u("",!0):(a(),d("span",Me,"None... "))])):u("",!0)])])]),e("div",Qe,[e("div",Be,[e("button",{class:"btn btn-sm btn-info w-100 mb-1",onClick:s[4]||(s[4]=n=>t.loadActionArtists(n))}," Load artists ")]),e("div",Ue,[e("div",Le,[e("h5",Te,[Ee,t.actionArtistsLoading?(a(),d("span",Se,"loading...")):u("",!0)]),t.actionArtists?(a(),d("div",Fe,[t.actionArtists.length?(a(),d("table",Re,[De,e("tbody",null,[(a(!0),d(y,null,q(t.actionArtists,n=>(a(),d("tr",{key:n.id,class:"text-white-50"},[e("td",je,[e("a",{href:t.findArtistBeatmapSearchUrl(n.label),target:"_blank"},c(n.label),9,Ne),e("a",{class:"ms-2",href:"#",onClick:m(_=>t.artistInput=n.label,["prevent"])},ze,8,Oe),e("a",{class:"ms-2",href:"#",onClick:m(_=>t.dismissArtist(n.id,_),["prevent"])},He,8,Ge),e("a",{class:"ms-2 text-danger",href:"#",onClick:m(_=>t.permanentlyDismissArtist(n.id,_),["prevent"])},Xe,8,Je)]),e("td",Ye,[n.notes&&n.notes.length?(a(),d("div",Ze,c(n.notes),1)):u("",!0)]),e("td",xe,[e("a",{href:"#","data-bs-toggle":"modal","data-bs-target":"#editFeaturedArtist",onClick:m(_=>t.$store.commit("setSelectedArtist",n),["prevent"])}," edit ",8,to)])]))),128))])])):t.actionArtistsLoading?u("",!0):(a(),d("span",so,"None... "))])):u("",!0)]),I(r,{class:"mb-2 col-sm-6",input:t.artistInput},null,8,["input"])])]),eo,t.selectedBeatmap?(a(),w(L,{key:0,beatmap:t.selectedBeatmap},null,8,["beatmap"])):u("",!0),t.selectedQuest?(a(),w(T,{key:1,quest:t.selectedQuest},null,8,["quest"])):u("",!0),t.selectedQuest?(a(),w(E,{key:2,quest:t.selectedQuest},null,8,["quest"])):u("",!0),t.selectedUser?(a(),w(S,{key:3,user:t.selectedUser},null,8,["user"])):u("",!0),t.selectedContest?(a(),w(F,{key:4,contest:t.selectedContest},null,8,["contest"])):u("",!0),t.selectedArtist?(a(),w(R,{key:5,"featured-artist":t.selectedArtist},null,8,["featured-artist"])):u("",!0)])}const go=Q(gs,[["render",oo]]);export{go as default};
