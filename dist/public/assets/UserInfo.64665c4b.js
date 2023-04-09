import{_ as s}from"./ModalDialog.472e77e7.js";import{d as e,i as t,o,u as a,w as i,j as r,f as n,q as d,G as u,O as p,t as c}from"./vendor.df51a6ea.js";var l=e({name:"UserInfo",components:{ModalDialog:s},props:{user:{type:Object,default:null}},data:()=>({badge:0,discordId:"",group:""}),watch:{user(){this.badge=this.user.badge||0,this.discordId=this.user.discordId||"",this.group=this.user.group||""}},created(){this.user&&(this.badge=this.user.badge||0,this.discordId=this.user.discordId||"",this.group=this.user.group||"")},methods:{async updateGroup(s){const e=await this.$http.executePost(`/admin/users/${this.user.id}/updateGroup`,{group:this.group},s);e&&(this.$store.dispatch("updateToastMessages",{message:`set group to ${e}`,type:"info"}),this.$store.commit("updateGroup",{userId:this.user.id,group:e}))},async updateBadge(s){const e=await this.$http.executePost(`/admin/users/${this.user.id}/updateBadge`,{badge:this.badge},s);e&&(this.$store.dispatch("updateToastMessages",{message:`set queued badge to ${e}`,type:"info"}),this.$store.commit("updateBadge",{userId:this.user.id,badge:e}))},async updateDiscordId(s){const e=await this.$http.executePost(`/admin/users/${this.user.id}/updateDiscordId`,{discordId:this.discordId},s);e&&(this.$store.dispatch("updateToastMessages",{message:`set discord ID to ${e}`,type:"info"}),this.$store.commit("updateDiscordId",{userId:this.user.id,discordId:e}))},async calculateUserPoints(s){await this.$http.executePost(`/admin/users/${this.user.id}/calculateUserPoints`,{},s)&&this.$store.dispatch("updateToastMessages",{message:"calculated points",type:"info"})},async toggleBypassLogin(s){const e=await this.$http.executePost(`/admin/users/${this.user.id}/toggleBypassLogin`,{bypassLogin:!this.user.bypassLogin},s);e&&(this.$store.dispatch("updateToastMessages",{message:`set bypassLogin to ${e.bypassLogin}`,type:"info"}),this.$store.commit("updateBypassLogin",{userId:this.user.id,group:e.group,bypassLogin:e.bypassLogin}))},async toggleIsShowcaseMapper(s){const e=await this.$http.executePost(`/admin/users/${this.user.id}/toggleIsShowcaseMapper`,{isShowcaseMapper:!this.user.isShowcaseMapper},s);e&&(this.$store.dispatch("updateToastMessages",{message:`set isShowcaseMapper ${e.isShowcaseMapper}`,type:"info"}),this.$store.commit("updateIsShowcaseMapper",{userId:this.user.id,isShowcaseMapper:e.isShowcaseMapper}))},async toggleIsMentorshipAdmin(s){const e=await this.$http.executePost(`/admin/users/${this.user.id}/toggleIsMentorshipAdmin`,{isMentorshipAdmin:!this.user.isMentorshipAdmin},s);e&&(this.$store.dispatch("updateToastMessages",{message:`set isMentorshipAdmin ${e.isMentorshipAdmin}`,type:"info"}),this.$store.commit("updateIsMentorshipAdmin",{userId:this.user.id,isMentorshipAdmin:e.isMentorshipAdmin}))}}});const h={class:"container"},g={class:"row"},m=[n("option",{value:"user"}," User ",-1),n("option",{value:"admin"}," Admin ",-1),n("option",{value:"secret"}," Secret ",-1),n("option",{value:"spectator"}," Spectator ",-1)],b={class:"row"},w={class:"row"};l.render=function(s,e,l,$,f,I){const M=t("user-link"),y=t("modal-dialog");return o(),a(y,{id:"editUser","header-class":s.user?"bg-rank-"+s.user.rank:"",loaded:Boolean(s.user)},{header:i((()=>[r(M,{user:s.user},null,8,["user"])])),default:i((()=>[n("div",h,[n("p",g,[d(n("select",{"onUpdate:modelValue":e[0]||(e[0]=e=>s.group=e),class:"form-select form-select-sm w-50 mx-2"},m,512),[[u,s.group]]),n("button",{class:"btn btn-sm btn-outline-info w-25",onClick:e[1]||(e[1]=e=>s.updateGroup(e))}," Save group ")]),n("p",b,[d(n("input",{"onUpdate:modelValue":e[2]||(e[2]=e=>s.badge=e),class:"form-control form-control-sm mx-2 w-50",type:"text",autocomplete:"off"},null,512),[[p,s.badge]]),n("button",{class:"btn btn-sm btn-outline-info w-25",onClick:e[3]||(e[3]=e=>s.updateBadge(e))}," Queue badge ")]),n("p",w,[d(n("input",{"onUpdate:modelValue":e[4]||(e[4]=e=>s.discordId=e),class:"form-control form-control-sm mx-2 w-50",type:"text",autocomplete:"off"},null,512),[[p,s.discordId]]),n("button",{class:"btn btn-sm btn-outline-info w-25",onClick:e[5]||(e[5]=e=>s.updateDiscordId(e))}," Save Discord ID ")]),n("p",null,[n("button",{class:"btn btn-sm btn-outline-info w-100",onClick:e[6]||(e[6]=e=>s.calculateUserPoints(e))}," Calculate user points ")]),n("p",null,[n("button",{class:"btn btn-sm btn-outline-info w-100",onClick:e[7]||(e[7]=e=>s.toggleBypassLogin(e))},c(s.user.bypassLogin?"Enable":"Disable")+" ranked maps login requirement ",1)]),n("p",null,[n("button",{class:"btn btn-sm btn-outline-info w-100",onClick:e[8]||(e[8]=e=>s.toggleIsShowcaseMapper(e))},c(s.user.isShowcaseMapper?"Disable":"Enable")+" showcase mapper ",1)]),n("p",null,[n("button",{class:"btn btn-sm btn-outline-info w-100",onClick:e[9]||(e[9]=e=>s.toggleIsMentorshipAdmin(e))},c(s.user.isMentorshipAdmin?"Disable":"Enable")+" mentorship admin ",1)])])])),_:1},8,["header-class","loaded"])};export{l as _};
