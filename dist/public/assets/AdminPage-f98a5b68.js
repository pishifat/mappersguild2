import{d as M,_ as B,o as a,c as y,w as q,j as u,t as c,i as I,a as e,y as m,e as d,b,f as _,p as h,s as D,u as j,W as N,M as W,m as O,k as l,F as w,r as v,n as A,q as G}from"./index-e8d68c0f.js";import{B as V}from"./BeatmapInfoAdmin-4b07f5ed.js";import{Q as z}from"./QuestInfo-f54678fa.js";import{M as U}from"./ModalDialog-0f3ef8dc.js";import{C as K}from"./CopyPaste-99af17e3.js";import{U as H}from"./UserInfo-b9cc8acb.js";import{F as J}from"./FeaturedArtistInfo-4c5beb7a.js";import{U as X}from"./UserLinkList-3bb66178.js";import{A as Y}from"./ArtistSearch-d2cd1c48.js";import"./task-21eeb954.js";import"./TasksChoice-26629496.js";import"./AssociatedBeatmaps-82be840e.js";const Z=M({name:"ReviewQuest",components:{CopyPaste:K,ModalDialog:U},props:{quest:{type:Object,required:!0}},data(){return{showArtistInput:!1,artistInput:this.quest.art,showNameInput:!1,nameInput:this.quest.name,showObjectiveInput:!1,objectiveInput:this.quest.descriptionMain,showRequiredMapsetsInput:!1,requiredMapsetsInput:this.quest.requiredMapsets,showPriceInput:!1,priceInput:this.quest.price,showTimeframeInput:!1,timeframeInput:this.quest.timeframe/(24*3600*1e3),showPartySizeInput:!1,minPartyInput:this.quest.minParty,maxPartyInput:this.quest.maxParty}},watch:{quest(){this.showArtistInput=!1,this.artistInput=this.quest.art,this.showNameInput=!1,this.nameInput=this.quest.name,this.showObjectiveInput=!1,this.objectiveInput=this.quest.descriptionMain,this.showRequiredMapsetsInput=!1,this.requiredMapsetsInput=this.quest.requiredMapsets,this.showPriceInput=!1,this.priceInput=this.quest.price,this.showTimeframeInput=!1,this.timeframeInput=this.quest.timeframe/(24*3600*1e3)}},methods:{async acceptPendingQuest(t){const s=await this.$http.executePost(`/admin/quests/${this.quest.id}/schedule`,{},t);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"scheduled quest",type:"info"}),this.$store.commit("updateStatus",{questId:this.quest.id,status:s}),this.$bs.hideModal("reviewQuest"))},async rejectPendingQuest(t){const s=await this.$http.executePost(`/admin/quests/${this.quest.id}/reject`,{},t);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"rejected quest",type:"info"}),this.$store.commit("updateStatus",{questId:this.quest.id,status:s}),this.$bs.hideModal("reviewQuest"))},async updateArt(t){const s=await this.$http.executePost(`/admin/quests/${this.quest.id}/updateArt`,{art:this.artistInput},t);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"updated artist",type:"info"}),this.$store.commit("updateArt",{questId:this.quest.id,art:s}),this.showArtistInput=!1)},async renameQuest(t){const s=await this.$http.executePost(`/admin/quests/${this.quest.id}/rename`,{name:this.nameInput},t);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"renamed quest",type:"info"}),this.$store.commit("renameQuest",{questId:this.quest.id,name:s}),this.showNameInput=!1)},async updateDescription(t){const s=await this.$http.executePost(`/admin/quests/${this.quest.id}/updateDescription/`,{description:this.objectiveInput},t);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"updated quest description",type:"info"}),this.$store.commit("updateDescription",{questId:this.quest.id,description:s}),this.showObjectiveInput=!1)},async updateRequiredMapsets(t){const s=await this.$http.executePost(`/admin/quests/${this.quest.id}/updateRequiredMapsets`,{requiredMapsets:this.requiredMapsetsInput},t);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"updated required mapsets",type:"info"}),this.$store.commit("updateRequiredMapsets",{questId:this.quest.id,requiredMapsets:s}),this.showRequiredMapsetsInput=!1)},async updatePrice(t){const s=await this.$http.executePost(`/admin/quests/${this.quest.id}/updatePrice`,{price:this.priceInput},t);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"updated price",type:"info"}),this.$store.commit("updatePrice",{questId:this.quest.id,price:s}),this.showPriceInput=!1)},async updateTimeframe(t){const s=await this.$http.executePost(`/admin/quests/${this.quest.id}/updateTimeframe`,{timeframe:this.timeframeInput},t);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"updated timeframe",type:"info"}),this.$store.commit("updateTimeframe",{questId:this.quest.id,timeframe:s}),this.showTimeframeInput=!1)},async updateMinParty(t){const s=await this.$http.executePost(`/admin/quests/${this.quest.id}/updateMinParty`,{minParty:this.minPartyInput},t);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"updated minParty",type:"info"}),this.$store.commit("updateMinParty",{questId:this.quest.id,minParty:s}),this.showPartySizeInput=!1)},async updateMaxParty(t){const s=await this.$http.executePost(`/admin/quests/${this.quest.id}/updateMaxParty`,{maxParty:this.maxPartyInput},t);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"updated maxParty",type:"info"}),this.$store.commit("updateMaxParty",{questId:this.quest.id,maxParty:s}),this.showPartySizeInput=!1)}}});const p=t=>(D("data-v-3d8fb1df"),t=t(),j(),t),x={class:"container"},tt={class:"small text-secondary"},st=p(()=>e("i",{class:"fas fa-edit"},null,-1)),et=[st],ot={key:0},it={key:1,class:"ms-2"},nt=["href"],at=["src"],dt={key:2,class:"ms-2"},rt={class:"small text-secondary"},ct=p(()=>e("i",{class:"fas fa-edit"},null,-1)),lt=[ct],ut={key:3},pt={key:4,class:"ms-2"},mt={class:"small text-secondary"},ht=p(()=>e("i",{class:"fas fa-edit"},null,-1)),ft=[ht],gt={key:5},bt={key:6,class:"ms-2"},$t={class:"small text-secondary"},_t=p(()=>e("i",{class:"fas fa-edit"},null,-1)),yt=[_t],It={key:7},kt={key:8,class:"ms-2"},At={class:"small text-secondary"},wt=p(()=>e("i",{class:"fas fa-edit"},null,-1)),vt=[wt],qt={key:9},Ct={key:10,class:"ms-2"},Pt={class:"small text-secondary"},Mt=p(()=>e("i",{class:"fas fa-edit"},null,-1)),Bt=[Mt],Qt={key:11},Ut={key:12,class:"ms-2"},Lt={class:"small text-secondary"},Tt=p(()=>e("i",{class:"fas fa-edit"},null,-1)),St=[Tt],Et={key:13},Ft={key:14,class:"ms-2"},Rt=p(()=>e("div",{class:"small text-secondary"}," Party rank ",-1)),Dt={class:"ms-2"},jt=p(()=>e("div",{class:"small text-secondary"}," MBC ",-1)),Nt={class:"ms-2"},Wt=p(()=>e("div",{class:"radial-divisor"},null,-1)),Ot=p(()=>e("button",{class:"btn btn-outline-secondary w-100","data-bs-toggle":"collapse","data-bs-target":"#forumPm"},[u(" See rejection message "),e("i",{class:"fas fa-angle-down"})],-1)),Gt={id:"forumPm",class:"collapse"},Vt=p(()=>e("div",null,"hello, you're receiving this message because you submitted a Mappers' Guild quest for review",-1)),zt=p(()=>e("div",null,"[box=your quest info]",-1)),Kt=p(()=>e("div",null,"[/box]",-1)),Ht=p(()=>e("div",null,"your quest has been rejected for the following reason(s):",-1)),Jt=p(()=>e("div",null,"[notice] REASONS [/notice]",-1)),Xt=p(()=>e("div",null,`points spent for submitting the quest have been returned to your "available points" pool. if you'd like to modify the quest according to above feedback, you can resubmit it and i'll review it again! or if you'd like to submit any other quest, that's fine too!`,-1)),Yt=p(()=>e("div",null,"thanks for being cool",-1));function Zt(t,s,o,i,f,Q){const k=h("user-link"),g=h("copy-paste"),C=h("modal-dialog");return a(),y(C,{id:"reviewQuest",loaded:Boolean(t.quest)},{header:q(()=>[u(c(t.quest.name)+" by ",1),I(k,{class:"text-dark",user:t.quest.creator},null,8,["user"])]),default:q(()=>[e("div",x,[e("div",tt,[u(" Artist "),e("a",{href:"#",onClick:s[0]||(s[0]=m(r=>t.showArtistInput=!t.showArtistInput,["prevent"]))},et)]),t.showArtistInput?(a(),d("p",ot,[b(e("input",{"onUpdate:modelValue":s[1]||(s[1]=r=>t.artistInput=r),class:"form-control form-control-sm w-100",type:"number",autocomplete:"off",placeholder:"artist ID...",onChange:s[2]||(s[2]=r=>t.updateArt(r))},null,544),[[_,t.artistInput,void 0,{number:!0}]])])):t.quest.art?(a(),d("p",it,[e("a",{href:"https://osu.ppy.sh/beatmaps/artists/"+t.quest.art,target:"_blank"},[e("img",{src:"https://assets.ppy.sh/artists/"+t.quest.art+"/cover.jpg",class:"card-avatar-img"},null,8,at)],8,nt)])):(a(),d("p",dt," None ")),e("div",rt,[u(" Name "),e("a",{href:"#",onClick:s[3]||(s[3]=m(r=>t.showNameInput=!t.showNameInput,["prevent"]))},lt)]),t.showNameInput?(a(),d("p",ut,[b(e("input",{"onUpdate:modelValue":s[4]||(s[4]=r=>t.nameInput=r),class:"form-control form-control-sm w-100",type:"text",autocomplete:"off",placeholder:"name...",onChange:s[5]||(s[5]=r=>t.renameQuest(r))},null,544),[[_,t.nameInput]])])):(a(),d("p",pt,c(t.quest.name),1)),e("div",mt,[u(" Objective "),e("a",{href:"#",onClick:s[6]||(s[6]=m(r=>t.showObjectiveInput=!t.showObjectiveInput,["prevent"]))},ft)]),t.showObjectiveInput?(a(),d("p",gt,[b(e("textarea",{"onUpdate:modelValue":s[7]||(s[7]=r=>t.objectiveInput=r),class:"form-control form-control-sm w-100",rows:"2",type:"text",autocomplete:"off",placeholder:"objective...",onChange:s[8]||(s[8]=r=>t.updateDescription(r))},null,544),[[_,t.objectiveInput]])])):(a(),d("p",bt,c(t.quest.descriptionMain),1)),e("div",$t,[u(" Required mapsets "),e("a",{href:"#",onClick:s[9]||(s[9]=m(r=>t.showRequiredMapsetsInput=!t.showRequiredMapsetsInput,["prevent"]))},yt)]),t.showRequiredMapsetsInput?(a(),d("p",It,[b(e("input",{"onUpdate:modelValue":s[10]||(s[10]=r=>t.requiredMapsetsInput=r),class:"form-control form-control-sm w-100",type:"number",autocomplete:"off",placeholder:"required mapsets...",onChange:s[11]||(s[11]=r=>t.updateRequiredMapsets(r))},null,544),[[_,t.requiredMapsetsInput,void 0,{number:!0}]])])):(a(),d("p",kt,c(t.quest.requiredMapsets),1)),e("div",At,[u(" Price "),e("a",{href:"#",onClick:s[12]||(s[12]=m(r=>t.showPriceInput=!t.showPriceInput,["prevent"]))},vt)]),t.showPriceInput?(a(),d("p",qt,[b(e("input",{"onUpdate:modelValue":s[13]||(s[13]=r=>t.priceInput=r),class:"form-control form-control-sm w-100",type:"number",autocomplete:"off",placeholder:"price per party member...",onChange:s[14]||(s[14]=r=>t.updatePrice(r))},null,544),[[_,t.priceInput,void 0,{number:!0}]])])):(a(),d("p",Ct,c(t.quest.price)+" points per user ",1)),e("div",Pt,[u(" Timeframe "),e("a",{href:"#",onClick:s[15]||(s[15]=m(r=>t.showTimeframeInput=!t.showTimeframeInput,["prevent"]))},Bt)]),t.showTimeframeInput?(a(),d("p",Qt,[b(e("input",{"onUpdate:modelValue":s[16]||(s[16]=r=>t.timeframeInput=r),class:"form-control form-control-sm w-100",type:"number",autocomplete:"off",placeholder:"days...",onChange:s[17]||(s[17]=r=>t.updateTimeframe(r))},null,544),[[_,t.timeframeInput,void 0,{number:!0}]])])):(a(),d("p",Ut,c(t.quest.timeframe/(24*3600*1e3))+" days ",1)),e("div",Lt,[u(" Party size "),e("a",{href:"#",onClick:s[18]||(s[18]=m(r=>t.showPartySizeInput=!t.showPartySizeInput,["prevent"]))},St)]),t.showPartySizeInput?(a(),d("p",Et,[b(e("input",{"onUpdate:modelValue":s[19]||(s[19]=r=>t.minPartyInput=r),class:"form-control form-control-sm w-100",type:"number",autocomplete:"off",placeholder:"minimum",onChange:s[20]||(s[20]=r=>t.updateMinParty(r))},null,544),[[_,t.minPartyInput,void 0,{number:!0}]]),b(e("input",{"onUpdate:modelValue":s[21]||(s[21]=r=>t.maxPartyInput=r),class:"form-control form-control-sm w-100",type:"number",autocomplete:"off",placeholder:"maximum",onChange:s[22]||(s[22]=r=>t.updateMaxParty(r))},null,544),[[_,t.maxPartyInput,void 0,{number:!0}]])])):(a(),d("p",Ft,c(t.quest.minParty)+"-"+c(t.quest.maxParty)+" members ",1)),Rt,e("p",Dt,c(t.quest.minRank)+" rank required ",1),jt,e("p",Nt,c(t.quest.isMbc?"yes":"no"),1),Wt,e("button",{type:"submit",class:"btn btn-outline-success w-100",onClick:s[23]||(s[23]=r=>t.acceptPendingQuest(r))}," Schedule quest "),e("button",{type:"submit",class:"btn btn-outline-danger w-100",onClick:s[24]||(s[24]=r=>t.rejectPendingQuest(r))}," Reject quest "),Ot,e("div",Gt,[I(g,null,{default:q(()=>[Vt,zt,e("div",null,"Artist: "+c("https://osu.ppy.sh/beatmaps/artists/"+t.quest.art),1),e("div",null,"Name: "+c(t.quest.name),1),e("div",null,"Objective: "+c(t.quest.descriptionMain),1),e("div",null,"Required mapsets: "+c(t.quest.requiredMapsets),1),e("div",null,"Price: "+c(t.quest.price)+" points per user",1),e("div",null,"Timeframe: "+c(t.quest.timeframe/(24*3600*1e3))+" days",1),e("div",null,"Party size: "+c(t.quest.minParty)+"-"+c(t.quest.maxParty)+" members",1),Kt,Ht,Jt,Xt,Yt]),_:1})])])]),_:1},8,["loaded"])}const xt=B(Z,[["render",Zt],["__scopeId","data-v-3d8fb1df"]]),ts=M({name:"ContestInfo",components:{ModalDialog:U},props:{contest:{type:Object,default:null}},methods:{async toggleIsApproved(t){const s=await this.$http.executePost(`/admin/contests/${this.contest.id}/toggleIsApproved`,{isApproved:!this.contest.isApproved},t);s&&(this.$store.dispatch("updateToastMessages",{message:`set isApproved to ${s.isApproved}`,type:"info"}),this.$store.commit("updateIsApproved",{contestId:this.contest.id,isApproved:s.isApproved}))},async toggleIsFeaturedArtistContest(t){const s=await this.$http.executePost(`/admin/contests/${this.contest.id}/toggleIsFeaturedArtistContest`,{isFeaturedArtistContest:!this.contest.isFeaturedArtistContest},t);s&&(this.$store.dispatch("updateToastMessages",{message:`set isFeaturedArtistContest to ${s.isFeaturedArtistContest}`,type:"info"}),this.$store.commit("updateIsFeaturedArtistContest",{contestId:this.contest.id,isFeaturedArtistContest:s.isFeaturedArtistContest}))},async toggleIsEligibleForPoints(t){const s=await this.$http.executePost(`/admin/contests/${this.contest.id}/toggleIsEligibleForPoints`,{isEligibleForPoints:!this.contest.isEligibleForPoints},t);s&&(this.$store.dispatch("updateToastMessages",{message:`set isEligibleForPoints to ${s.isEligibleForPoints}`,type:"info"}),this.$store.commit("updateIsEligibleForPoints",{contestId:this.contest.id,isEligibleForPoints:s.isEligibleForPoints}))},async toggleSkipWebhook(t){const s=await this.$http.executePost(`/admin/contests/${this.contest.id}/toggleSkipWebhook`,{skipWebhook:!this.contest.skipWebhook},t);s&&(this.$store.dispatch("updateToastMessages",{message:`set skipWebhook to ${s.skipWebhook}`,type:"info"}),this.$store.commit("updateSkipWebhook",{contestId:this.contest.id,skipWebhook:s.skipWebhook}))}}}),ss=["href"],es={class:"container"},os={class:"row"},is={class:"col-sm-6"},ns={class:"text-danger me-2"},as={class:"row"},ds={class:"col-sm-6"},rs={class:"text-danger me-2"},cs={class:"row"},ls={class:"col-sm-6"},us={class:"text-danger me-2"},ps=e("hr",null,null,-1),ms={class:"row"},hs={class:"col-sm-6"},fs={class:"text-danger me-2"};function gs(t,s,o,i,f,Q){const k=h("modal-dialog");return a(),y(k,{id:"editContest",loaded:Boolean(t.contest)},{header:q(()=>[e("a",{href:`/contests/listing?contest=${t.contest.id}`,target:"_blank"},c(t.contest.name),9,ss)]),default:q(()=>[e("div",es,[e("p",os,[e("span",is,[u(" Featured Artist contest: "),e("span",ns,c(t.contest.isFeaturedArtistContest?"true":"false"),1)]),e("button",{class:"btn btn-sm btn-outline-info ms-3 w-25",onClick:s[0]||(s[0]=g=>t.toggleIsFeaturedArtistContest(g))}," Toggle ")]),e("p",as,[e("span",ds,[u(" Eligible for points: "),e("span",rs,c(t.contest.isEligibleForPoints?"true":"false"),1)]),e("button",{class:"btn btn-sm btn-outline-info ms-3 w-25",onClick:s[1]||(s[1]=g=>t.toggleIsEligibleForPoints(g))}," Toggle ")]),e("p",cs,[e("span",ls,[u(" Skip webhook: "),e("span",us,c(t.contest.skipWebhook?"true":"false"),1)]),e("button",{class:"btn btn-sm btn-outline-info ms-3 w-25",onClick:s[2]||(s[2]=g=>t.toggleSkipWebhook(g))}," Toggle ")]),ps,e("p",ms,[e("span",hs,[u(" Publicly visible: "),e("span",fs,c(t.contest.isApproved?"true":"false"),1)]),e("button",{class:"btn btn-sm btn-outline-info ms-3 w-25",onClick:s[3]||(s[3]=g=>t.toggleIsApproved(g))}," Toggle ")])])]),_:1},8,["loaded"])}const bs=B(ts,[["render",gs]]),$s={state:{actionBeatmaps:[],actionBeatmapsLoading:!1,actionQuests:[],actionQuestsLoading:!1,actionUsers:[],actionUsersLoading:!1,actionContests:[],actionContestsLoading:!1,actionArtists:[],actionArtistsLoading:!1,selectedBeatmap:null,selectedQuest:null,selectedUser:null,selectedContest:null,selectedArtist:null},mutations:{setActionBeatmaps(t,s){t.actionBeatmaps=s},setActionBeatmapsLoading(t,s){t.actionBeatmapsLoading=s},setActionQuests(t,s){t.actionQuests=s},setActionQuestsLoading(t,s){t.actionQuestsLoading=s},setActionUsers(t,s){t.actionUsers=s},setActionUsersLoading(t,s){t.actionUsersLoading=s},setActionContests(t,s){t.actionContests=s},setActionContestsLoading(t,s){t.actionContestsLoading=s},setActionArtists(t,s){t.actionArtists=s},setActionArtistsLoading(t,s){t.actionArtistsLoading=s},setSelectedBeatmap(t,s){t.selectedBeatmap=s},setSelectedQuest(t,s){t.selectedQuest=s},setSelectedUser(t,s){t.selectedUser=s},setSelectedContest(t,s){t.selectedContest=s},setSelectedArtist(t,s){t.selectedArtist=s},updateBeatmap(t,s){const o=t.actionBeatmaps.findIndex(i=>i.id===s.id);o!==-1&&(t.actionBeatmaps[o]=s,t.selectedBeatmap=s)},updateBeatmapStatus(t,s){const o=t.actionBeatmaps.find(i=>i.id==s.beatmapId);if(o&&(o.status=s.status,o.status==N.Ranked)){const i=t.actionBeatmaps.findIndex(f=>f.id===s.beatmapId);t.actionBeatmaps.splice(i,1)}},deleteTask(t,s){const o=t.actionBeatmaps.find(i=>i.id==s.beatmapId);if(o){const i=o.tasks.findIndex(f=>f.id==s.taskId);i!==-1&&o.tasks.splice(i,1)}},deleteModder(t,s){const o=t.actionBeatmaps.find(i=>i.id==s.beatmapId);if(o){const i=o.modders.findIndex(f=>f.id==s.modderId);i!==-1&&o.modders.splice(i,1)}},updateUrl(t,s){const o=t.actionBeatmaps.find(i=>i.id==s.beatmapId);o&&(o.url=s.url)},updateStoryboardQuality(t,s){const o=t.actionBeatmaps.find(i=>i.id==s.beatmapId);if(o){const i=o.tasks.findIndex(f=>f.id==s.taskId);i!==-1&&(o.tasks[i]=s.task)}},updatePackId(t,s){const o=t.actionBeatmaps.find(i=>i.id==s.beatmapId);o&&(o.packId=s.packId)},updateIsShowcase(t,s){const o=t.actionBeatmaps.find(i=>i.id==s.beatmapId);o&&(o.isShowcase=s.isShowcase)},updateIsWorldCup(t,s){const o=t.actionBeatmaps.find(i=>i.id==s.beatmapId);o&&(o.isWorldCup=s.isWorldCup)},updateQueuedForRank(t,s){const o=t.actionBeatmaps.find(i=>i.id==s.beatmapId);o&&(o.queuedForRank=s.queuedForRank)},updateSkipBeatmapWebhook(t,s){const o=t.actionBeatmaps.find(i=>i.id==s.beatmapId);o&&(o.skipWebhook=s.skipWebhook)},updateArt(t,s){const o=t.actionQuests.find(i=>i.id==s.questId);o&&(o.art=s.art)},renameQuest(t,s){const o=t.actionQuests.find(i=>i.id==s.questId);o&&(o.name=s.name)},updateDescription(t,s){const o=t.actionQuests.find(i=>i.id==s.questId);o&&(o.descriptionMain=s.description)},updateRequiredMapsets(t,s){const o=t.actionQuests.find(i=>i.id==s.questId);o&&(o.requiredMapsets=s.requiredMapsets)},updatePrice(t,s){const o=t.actionQuests.find(i=>i.id==s.questId);o&&(o.price=s.price)},updateTimeframe(t,s){const o=t.actionQuests.find(i=>i.id==s.questId);o&&(o.timeframe=s.timeframe*(24*3600*1e3))},updateMinParty(t,s){const o=t.actionQuests.find(i=>i.id==s.questId);o&&(o.minParty=s.minParty)},updateMaxParty(t,s){const o=t.actionQuests.find(i=>i.id==s.questId);o&&(o.maxParty=s.maxParty)},updateStatus(t,s){const o=t.actionQuests.find(i=>i.id==s.questId);if(o&&(o.status=s.status,o.status=="open"||o.status=="rejected")){const i=t.actionQuests.findIndex(f=>f.id===s.questId);t.actionQuests.splice(i,1)}},updateQueuedForCompletion(t,s){const o=t.actionQuests.find(i=>i.id==s.questId);o&&(o.queuedForCompletion=s.queuedForCompletion)},updateGroup(t,s){const o=t.actionUsers.find(i=>i.id==s.userId);o&&(o.group=s.group)},updateQueuedBadge(t,s){const o=t.actionUsers.find(i=>i.id==s.userId);o&&(o.queuedBadge=s.badge)},updateBadge(t,s){const o=t.actionUsers.find(i=>i.id==s.userId);o&&(o.badge=s.badge)},updateDiscordId(t,s){const o=t.actionUsers.find(i=>i.id==s.userId);o&&(o.discordId=s.discordId)},updateIsApproved(t,s){const o=t.actionContests.find(i=>i.id==s.contestId);o&&(o.isApproved=s.isApproved)},updateIsFeaturedArtistContest(t,s){const o=t.actionContests.find(i=>i.id==s.contestId);o&&(o.isFeaturedArtistContest=s.isFeaturedArtistContest)},updateIsEligibleForPoints(t,s){const o=t.actionContests.find(i=>i.id==s.contestId);o&&(o.isEligibleForPoints=s.isEligibleForPoints)},updateSkipWebhook(t,s){const o=t.actionContests.find(i=>i.id==s.contestId);o&&(o.skipWebhook=s.skipWebhook)},updateNotes(t,s){const o=t.actionArtists.find(i=>i.id==s.featuredArtistId);o&&(o.notes=s.notes)},updateLastReviewed(t,s){const o=t.actionArtists.find(i=>i.id==s.featuredArtistId);o&&(o.lastReviewed=s.lastReviewed)},updatePermanentlyDismiss(t,s){const o=t.actionArtists.find(i=>i.id==s.featuredArtistId);o&&(o.permanentlyDismiss=s.permanentlyDismiss)},removeFromActionArtists(t,s){const o=t.actionArtists.findIndex(i=>i.id==s.featuredArtistId);o!==-1&&t.actionArtists.splice(o,1)}}},_s=$s,ys=M({name:"AdminPage",components:{BeatmapInfoAdmin:V,QuestInfo:z,ReviewQuest:xt,UserInfo:H,ContestInfo:bs,ModesIcons:W,UserLinkList:X,ArtistSearch:Y,FeaturedArtistInfo:J},data(){return{artistInput:""}},computed:{...O({actionBeatmaps:t=>t.admin.actionBeatmaps,actionBeatmapsLoading:t=>t.admin.actionBeatmapsLoading,actionQuests:t=>t.admin.actionQuests,actionQuestsLoading:t=>t.admin.actionQuestsLoading,actionUsers:t=>t.admin.actionUsers,actionUsersLoading:t=>t.admin.actionUsersLoading,actionContests:t=>t.admin.actionContests,actionContestsLoading:t=>t.admin.actionContestsLoading,actionArtists:t=>t.admin.actionArtists,actionArtistsLoading:t=>t.admin.actionArtistsLoading,selectedBeatmap:t=>t.admin.selectedBeatmap,selectedQuest:t=>t.admin.selectedQuest,selectedUser:t=>t.admin.selectedUser,selectedContest:t=>t.admin.selectedContest,selectedArtist:t=>t.admin.selectedArtist})},beforeCreate(){this.$store.hasModule("admin")||this.$store.registerModule("admin",_s)},unmounted(){this.$store.hasModule("admin")&&this.$store.unregisterModule("admin")},methods:{command(t){let s;switch(t.rank){case 1:s="first";break;case 2:s="second";break;case 3:s="third";break;case 4:s="fourth";break}switch(t.rank){case 0:return"";case 1:return`.add-badge ${t.osuId} mg2018-${t.rank}star.png "Mappers' Guild ${s} level contributor" https://osu.ppy.sh/wiki/Community/Mappers_Guild`;default:return`.add-badge ${t.osuId} mg2018-${t.rank}star.png "Mappers' Guild ${s} level contributor" https://osu.ppy.sh/wiki/Community/Mappers_Guild --replace mg2018-${t.rank-1}star.png`}},generateMetadata(t){let s=t.artist+" - ";return t.title.length>40?s+=t.title.slice(0,40)+"...":s+=t.title,s},async loadActionBeatmaps(t){{this.$store.commit("setActionBeatmaps",[]),this.$store.commit("setActionBeatmapsLoading",!0);const s=await this.$http.executeGet("/admin/loadActionBeatmaps",t);this.$http.isError(s)||this.$store.commit("setActionBeatmaps",s),this.$store.commit("setActionBeatmapsLoading",!1)}},async loadActionQuests(t){this.$store.commit("setActionQuests",[]),this.$store.commit("setActionQuestsLoading",!0);const s=await this.$http.executeGet("/admin/loadActionQuests",t);this.$http.isError(s)||this.$store.commit("setActionQuests",s),this.$store.commit("setActionQuestsLoading",!1)},async loadActionUsers(t){this.$store.commit("setActionUsers",[]),this.$store.commit("setActionUsersLoading",!0);const s=await this.$http.executeGet("/admin/loadActionUsers",t);this.$http.isError(s)||this.$store.commit("setActionUsers",s),this.$store.commit("setActionUsersLoading",!1)},async loadActionContests(t){this.$store.commit("setActionContests",[]),this.$store.commit("setActionContestsLoading",!0);const s=await this.$http.executeGet("/admin/loadActionContests",t);this.$http.isError(s)||this.$store.commit("setActionContests",s),this.$store.commit("setActionContestsLoading",!1)},async loadActionArtists(t){this.$store.commit("setActionArtists",[]),this.$store.commit("setActionArtistsLoading",!0);const s=await this.$http.executeGet("/admin/loadActionArtists",t);this.$http.isError(s)||this.$store.commit("setActionArtists",s),this.$store.commit("setActionArtistsLoading",!1)},findArtistBeatmapSearchUrl(t){return`https://osu.ppy.sh/beatmapsets?q=artist%3D"${t}"&s=any&sort=plays_desc`},async dismissArtist(t,s){const o=await this.$http.executePost(`/admin/featuredArtists/${t}/updateLastReviewed`,{},s);this.$http.isError(o)||(this.$store.dispatch("updateToastMessages",{message:"updated last reviewed",type:"info"}),this.$store.commit("removeFromActionArtists",{featuredArtistId:t}))},async permanentlyDismissArtist(t,s){const o=await this.$http.executePost(`/admin/featuredArtists/${t}/togglePermanentlyDismiss`,{},s);this.$http.isError(o)||(this.$store.dispatch("updateToastMessages",{message:`updated permanenlty dismiss: ${o}`,type:"info"}),this.$store.commit("removeFromActionArtists",{featuredArtistId:t}))}}}),Is={class:"container card card-body py-1 mb-4"},ks={class:"row mx-3 mt-2"},As={class:"row"},ws={class:"col"},vs={class:"ms-4 mt-2"},qs=e("a",{href:"#actionBeatmaps","data-bs-toggle":"collapse"},[u(" Beatmaps "),e("i",{class:"fas fa-angle-down"})],-1),Cs={key:0,class:"ms-2 small text-secondary"},Ps={id:"actionBeatmaps",class:"show"},Ms={key:0,class:"table table-sm"},Bs=e("thead",null,[e("tr",null,[e("th",{scope:"col"}," METADATA "),e("th",{scope:"col"}," PACK ID "),e("th",{scope:"col"}," STATUS "),e("th",{scope:"col"}," EDIT ")])],-1),Qs={scope:"row"},Us=["href"],Ls={key:1,class:"ms-1"},Ts={scope:"row"},Ss={scope:"row"},Es={scope:"row"},Fs=["onClick"],Rs={key:1,class:"text-secondary ms-5"},Ds={class:"container card card-body py-1 mb-4"},js={class:"row mx-3 mt-2"},Ns={class:"row"},Ws={class:"col"},Os={class:"ms-4 mt-2"},Gs=e("a",{href:"#actionQuests","data-bs-toggle":"collapse"},[u(" Quests "),e("i",{class:"fas fa-angle-down"})],-1),Vs={key:0,class:"ms-2 small text-secondary"},zs={id:"actionQuests",class:"show"},Ks={key:0,class:"table table-sm"},Hs=e("thead",null,[e("tr",null,[e("th",{scope:"col"}," NAME "),e("th",{scope:"col"}," CREATOR "),e("th",{scope:"col"}," MODES "),e("th",{scope:"col"}," STATUS "),e("th",{scope:"col"}," MAPSETS "),e("th",{scope:"col"}," EDIT ")])],-1),Js={scope:"row"},Xs={scope:"row"},Ys={scope:"row"},Zs={scope:"row"},xs={scope:"row"},te={scope:"row"},se=["data-bs-target","onClick"],ee={key:1,class:"text-secondary ms-5"},oe={class:"container card card-body py-1 mb-4"},ie={class:"row mx-3 mt-2"},ne={class:"row"},ae={class:"col"},de={class:"ms-4 mt-2"},re=e("a",{href:"#actionUsers","data-bs-toggle":"collapse"},[u(" Users "),e("i",{class:"fas fa-angle-down"})],-1),ce={key:0,class:"ms-2 small text-secondary"},le={key:0,id:"actionUsers",class:"show"},ue={key:0,class:"table table-sm"},pe=e("thead",null,[e("tr",null,[e("th",{scope:"col"}," USERNAME "),e("th",{scope:"col"}," RANK "),e("th",{scope:"col"}," QUEUED BADGE "),e("th",{scope:"col"}," BADGE "),e("th",{scope:"col"}," COMMAND "),e("th",{scope:"col"}," EDIT ")])],-1),me={scope:"row"},he={scope:"row"},fe={scope:"row"},ge={class:"small"},be={scope:"row"},$e=["onClick"],_e={key:1,class:"text-secondary ms-5"},ye={class:"container card card-body py-1 mb-4"},Ie={class:"row mx-3 mt-2"},ke={class:"row"},Ae={class:"col"},we={class:"ms-4 mt-2"},ve=e("a",{href:"#actionContests","data-bs-toggle":"collapse"},[u(" Contests "),e("i",{class:"fas fa-angle-down"})],-1),qe={key:0,class:"ms-2 small text-secondary"},Ce={key:0,id:"actionContests",class:"show"},Pe={key:0,class:"table table-sm"},Me=e("thead",null,[e("tr",null,[e("th",{scope:"col"}," CONTEST "),e("th",{scope:"col"}," CREATOR "),e("th",{scope:"col"}," EDIT ")])],-1),Be={scope:"row"},Qe=["href"],Ue={scope:"row"},Le={scope:"row"},Te=["onClick"],Se={key:1,class:"text-secondary ms-5"},Ee={class:"container card card-body py-1"},Fe={class:"row mx-3 mt-2"},Re={class:"row"},De={class:"col-sm-6"},je={class:"ms-4 mt-2"},Ne=e("a",{href:"#actionArtists","data-bs-toggle":"collapse"},[u(" Artists "),e("i",{class:"fas fa-angle-down"})],-1),We={key:0,class:"ms-2 small text-secondary"},Oe={key:0,id:"actionArtists",class:"show"},Ge={key:0,class:"table table-sm"},Ve=e("thead",null,[e("tr",null,[e("th",{scope:"col"}," ARTIST "),e("th",{scope:"col"}," COMMENT "),e("th",{scope:"col"}," EDIT ")])],-1),ze={scope:"row"},Ke=["href"],He=["onClick"],Je=e("i",{class:"fa fa-arrow-right"},null,-1),Xe=[Je],Ye=["onClick"],Ze=e("i",{class:"fas fa-times"},null,-1),xe=[Ze],to=["onClick"],so=e("i",{class:"fas fa-times"},null,-1),eo=[so],oo={scope:"row",class:"small"},io={key:0},no={scope:"row"},ao=["onClick"],ro={key:1,class:"text-secondary ms-5"},co=e("div",{class:"radial-divisor"},null,-1);function lo(t,s,o,i,f,Q){const k=h("modes-icons"),g=h("user-link"),C=h("user-link-list"),r=h("artist-search"),L=h("beatmap-info-admin"),T=h("quest-info"),S=h("review-quest"),E=h("user-info"),F=h("contest-info"),R=h("featured-artist-info"),P=G("bs-tooltip");return a(),d("div",null,[e("div",Is,[e("div",ks,[e("button",{class:"btn btn-sm btn-info w-100 mb-1",onClick:s[0]||(s[0]=n=>t.loadActionBeatmaps(n))}," Load beatmaps ")]),e("div",As,[e("div",ws,[e("h5",vs,[qs,t.actionBeatmapsLoading?(a(),d("span",Cs,"loading...")):l("",!0)]),e("div",Ps,[t.actionBeatmaps.length?(a(),d("table",Ms,[Bs,e("tbody",null,[(a(!0),d(w,null,v(t.actionBeatmaps,n=>(a(),d("tr",{key:n.id,class:A(["text-secondary",n.rankedDate?"bg-warning":""])},[e("td",Qs,[I(k,{modes:[n.mode]},null,8,["modes"]),n.url?(a(),d("a",{key:0,href:n.url,class:"ms-1"},c(t.generateMetadata(n.song)),9,Us)):(a(),d("span",Ls,c(t.generateMetadata(n.song)),1))]),e("td",Ts,c(n.packId),1),e("td",Ss,c(n.status),1),e("td",Es,[e("a",{href:"#","data-bs-toggle":"modal","data-bs-target":"#editBeatmap",onClick:m($=>t.$store.commit("setSelectedBeatmap",n),["prevent"])}," edit ",8,Fs)])],2))),128))])])):t.actionBeatmapsLoading?l("",!0):(a(),d("span",Rs,"None..."))])])])]),e("div",Ds,[e("div",js,[e("button",{class:"btn btn-sm btn-info w-100 mb-1",onClick:s[1]||(s[1]=n=>t.loadActionQuests(n))}," Load quests ")]),e("div",Ns,[e("div",Ws,[e("h5",Os,[Gs,t.actionQuestsLoading?(a(),d("span",Vs,"loading...")):l("",!0)]),e("div",zs,[t.actionQuests.length?(a(),d("table",Ks,[Hs,e("tbody",null,[(a(!0),d(w,null,v(t.actionQuests,n=>(a(),d("tr",{key:n.id,class:"text-secondary"},[e("td",Js,c(n.name),1),e("td",Xs,c(n.creator.username),1),e("td",Ys,[I(k,{modes:n.modes},null,8,["modes"])]),e("td",Zs,c(n.status),1),e("td",xs,c(n.requiredMapsets),1),e("td",te,[e("a",{href:"#","data-bs-toggle":"modal","data-bs-target":n.status=="pending"?"#reviewQuest":"#editQuest",onClick:m($=>t.$store.commit("setSelectedQuest",n),["prevent"])}," edit ",8,se)])]))),128))])])):t.actionQuestsLoading?l("",!0):(a(),d("span",ee,"None..."))])])])]),e("div",oe,[e("div",ie,[e("button",{class:"btn btn-sm btn-info w-100 mb-1",onClick:s[2]||(s[2]=n=>t.loadActionUsers(n))}," Load users ")]),e("div",ne,[e("div",ae,[e("h5",de,[re,t.actionUsersLoading?(a(),d("span",ce,"loading...")):l("",!0)]),t.actionUsers?(a(),d("div",le,[t.actionUsers.length?(a(),d("table",ue,[pe,e("tbody",null,[(a(!0),d(w,null,v(t.actionUsers,n=>(a(),d("tr",{key:n.id,class:"text-secondary"},[e("td",me,[I(g,{user:n},null,8,["user"])]),e("td",he,[n.rank?b((a(),d("i",{key:0,class:A(["fas fa-crown","text-rank-"+n.rank])},null,2)),[[P,`rank ${n.rank} user`]]):l("",!0)]),e("td",{scope:"row",class:A({"bg-open":n.rank!=n.queuedBadge})},[n.queuedBadge?b((a(),d("i",{key:0,class:A(["fas fa-crown","text-rank-"+n.queuedBadge])},null,2)),[[P,`rank ${n.queuedBadge} user`]]):l("",!0)],2),e("td",{scope:"row",class:A({"bg-open":n.rank!=n.badge})},[n.badge?b((a(),d("i",{key:0,class:A(["fas fa-crown","text-rank-"+n.badge])},null,2)),[[P,`rank ${n.badge} user`]]):l("",!0)],2),e("td",fe,[e("code",ge,c(t.command(n)),1)]),e("td",be,[e("a",{href:"#","data-bs-toggle":"modal","data-bs-target":"#editUser",onClick:m($=>t.$store.commit("setSelectedUser",n),["prevent"])}," edit ",8,$e)])]))),128))])])):t.actionUsersLoading?l("",!0):(a(),d("span",_e,"None..."))])):l("",!0)])])]),e("div",ye,[e("div",Ie,[e("button",{class:"btn btn-sm btn-info w-100 mb-1",onClick:s[3]||(s[3]=n=>t.loadActionContests(n))}," Load contests ")]),e("div",ke,[e("div",Ae,[e("h5",we,[ve,t.actionContestsLoading?(a(),d("span",qe,"loading...")):l("",!0)]),t.actionContests?(a(),d("div",Ce,[t.actionContests.length?(a(),d("table",Pe,[Me,e("tbody",null,[(a(!0),d(w,null,v(t.actionContests,n=>(a(),d("tr",{key:n.id,class:"text-secondary"},[e("td",Be,[e("a",{href:"/contests/listing?contest="+n.id},c(n.name),9,Qe)]),e("td",Ue,[I(C,{users:n.creators},null,8,["users"])]),e("td",Le,[e("a",{href:"#","data-bs-toggle":"modal","data-bs-target":"#editContest",onClick:m($=>t.$store.commit("setSelectedContest",n),["prevent"])}," edit ",8,Te)])]))),128))])])):t.actionContestsLoading?l("",!0):(a(),d("span",Se,"None... "))])):l("",!0)])])]),e("div",Ee,[e("div",Fe,[e("button",{class:"btn btn-sm btn-info w-100 mb-1",onClick:s[4]||(s[4]=n=>t.loadActionArtists(n))}," Load artists ")]),e("div",Re,[e("div",De,[e("h5",je,[Ne,t.actionArtistsLoading?(a(),d("span",We,"loading...")):l("",!0)]),t.actionArtists?(a(),d("div",Oe,[t.actionArtists.length?(a(),d("table",Ge,[Ve,e("tbody",null,[(a(!0),d(w,null,v(t.actionArtists,n=>(a(),d("tr",{key:n.id,class:"text-secondary"},[e("td",ze,[e("a",{href:t.findArtistBeatmapSearchUrl(n.label),target:"_blank"},c(n.label),9,Ke),e("a",{class:"ms-2",href:"#",onClick:m($=>t.artistInput=n.label,["prevent"])},Xe,8,He),e("a",{class:"ms-2",href:"#",onClick:m($=>t.dismissArtist(n.id,$),["prevent"])},xe,8,Ye),e("a",{class:"ms-2 text-danger",href:"#",onClick:m($=>t.permanentlyDismissArtist(n.id,$),["prevent"])},eo,8,to)]),e("td",oo,[n.notes&&n.notes.length?(a(),d("div",io,c(n.notes),1)):l("",!0)]),e("td",no,[e("a",{href:"#","data-bs-toggle":"modal","data-bs-target":"#editFeaturedArtist",onClick:m($=>t.$store.commit("setSelectedArtist",n),["prevent"])}," edit ",8,ao)])]))),128))])])):t.actionArtistsLoading?l("",!0):(a(),d("span",ro,"None... "))])):l("",!0)]),I(r,{class:"mb-2 col-sm-6",input:t.artistInput},null,8,["input"])])]),co,t.selectedBeatmap?(a(),y(L,{key:0,beatmap:t.selectedBeatmap},null,8,["beatmap"])):l("",!0),t.selectedQuest?(a(),y(T,{key:1,quest:t.selectedQuest},null,8,["quest"])):l("",!0),t.selectedQuest?(a(),y(S,{key:2,quest:t.selectedQuest},null,8,["quest"])):l("",!0),t.selectedUser?(a(),y(E,{key:3,user:t.selectedUser},null,8,["user"])):l("",!0),t.selectedContest?(a(),y(F,{key:4,contest:t.selectedContest},null,8,["contest"])):l("",!0),t.selectedArtist?(a(),y(R,{key:5,"featured-artist":t.selectedArtist},null,8,["featured-artist"])):l("",!0)])}const Ao=B(ys,[["render",lo]]);export{Ao as default};
