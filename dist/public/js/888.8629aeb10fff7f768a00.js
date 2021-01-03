(self.webpackChunkmappersguild=self.webpackChunkmappersguild||[]).push([[888],{1107:(t,e,i)=>{"use strict";var a,n,s,o;i.d(e,{XE:()=>a,hY:()=>s}),function(t){t.Easy="Easy",t.Normal="Normal",t.Hard="Hard",t.Insane="Insane",t.Expert="Expert",t.Storyboard="Storyboard"}(a||(a={})),function(t){t.Osu="osu",t.Taiko="taiko",t.Catch="catch",t.Mania="mania",t.SB="sb"}(n||(n={})),function(t){t.WIP="WIP",t.Done="Done"}(s||(s={})),function(t){t[t.Meh=1]="Meh",t[t.Ok=2]="Ok",t[t.Nice=3]="Nice"}(o||(o={}))},1515:(t,e,i)=>{"use strict";i.d(e,{Z:()=>r});var a=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"modal fade",attrs:{tabindex:"-1"}},[i("div",{staticClass:"modal-dialog",class:"modal-"+t.modalSize},[t.loaded?i("div",{staticClass:"modal-content the-a-background"},[i("div",{staticClass:"modal-header",class:t.headerClass||"bg-primary"},[i("h5",{staticClass:"modal-title"},[t._t("header",[t._v("\n                        "+t._s(t.title)+"\n                    ")])],2),t._v(" "),i("a",{staticClass:"close",attrs:{href:"#","data-dismiss":"modal"},on:{click:function(t){t.preventDefault()}}},[t._v("\n                    ×\n                ")])]),t._v(" "),i("div",{staticClass:"modal-body"},[t._t("default")],2),t._v(" "),t.$slots.footer?i("div",{staticClass:"modal-footer"},[t._t("footer")],2):t._e()]):t._e()])])};a._withStripped=!0;var n=i(2934);const s=i.n(n)().extend({name:"ModalDialog",props:{title:{type:String,default:""},modalSize:{type:String,default:"lg"},headerClass:{type:String,default:"bg-primary"},loaded:{type:Boolean,default:!0}}});var o=(0,i(1900).Z)(s,a,[],!1,null,null,null);o.options.__file="src/components/ModalDialog.vue";const r=o.exports},5908:(t,e,i)=>{"use strict";i.r(e),i.d(e,{default:()=>D});var a=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",[i("div",{staticClass:"container card card-body py-3 mb-2"},[i("div",{staticClass:"row"},[i("div",{staticClass:"col-md-6"},[i("h2",[t._v("\n                    Notifications\n                    "),i("button",{staticClass:"btn btn-outline-info btn-sm ml-1",on:{click:function(e){return e.preventDefault(),t.hideAll(e)}}},[t._v("\n                        Mark all as read\n                    ")])]),t._v(" "),i("transition-group",{staticClass:"row",attrs:{name:"list",tag:"div"}},t._l(t.notifications,(function(e){return i("notification-card",{key:e.id,attrs:{notification:e},on:{"update:selectedMap":function(e){t.selectedMap=e},"update:selectedParty":function(e){t.selectedParty=e},"hide-notification":function(e){return t.hideNotification(e)}}})})),1),t._v(" "),t.notifications.length?t._e():i("p",{staticClass:"ml-4"},[t._v("\n                    No notifications...\n                ")])],1),t._v(" "),i("div",{staticClass:"col-md-6"},[i("h2",[t._v("\n                    Invites\n                    "),i("button",{staticClass:"btn btn-outline-danger btn-sm ml-1",on:{click:function(e){return e.preventDefault(),t.declineAll(e)}}},[t._v("\n                        Decline all\n                    ")])]),t._v(" "),i("transition-group",{staticClass:"row",attrs:{name:"list",tag:"div"}},t._l(t.invites,(function(e){return i("invite-card",{key:e.id,attrs:{invite:e},on:{"update:info":function(e){t.info=e},"update:selectedMap":function(e){t.selectedMap=e},"update:selectedParty":function(e){t.selectedParty=e},"hide-invite":function(e){return t.hideInvite(e)}}})})),1),t._v(" "),t.invites.length?t._e():i("p",{staticClass:"ml-4"},[t._v("\n                    No invites...\n                ")])],1)])]),t._v(" "),t.selectedMap?i("limited-map-info",{attrs:{beatmap:t.selectedMap}}):t._e(),t._v(" "),t.selectedParty?i("limited-party-info",{attrs:{party:t.selectedParty}}):t._e()],1)};a._withStripped=!0;var n=i(2934),s=i.n(n),o=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"col-md-12 my-1"},[i("div",{staticClass:"card card-body card-level-2 p-2"},[i("div",{staticClass:"card-text small"},[i("a",{attrs:{href:"https://osu.ppy.sh/users/"+t.notification.sender.osuId,target:"_blank"},on:{click:function(t){t.stopPropagation()}}},[t._v("\n                "+t._s(t.notification.sender.username)+"\n            ")]),t._v("\n\n            "+t._s(t.notification.info)+"\n\n            "),t.notification.map?i("span",[t.notification.map.url?i("span",[i("a",{attrs:{href:t.notification.map.url,target:"_blank"}},[t._v('"'+t._s(t.notification.map.song.artist)+" - "+t._s(t.notification.map.song.title)+'"')])]):i("span",[t._v('"'+t._s(t.notification.map.song.artist)+" - "+t._s(t.notification.map.song.title)+'"')]),t._v(" "),i("a",{staticClass:"text-done",attrs:{href:"#","data-user":t.notification.map.id,"data-toggle":"modal","data-target":"#limitedEditBeatmap"},on:{click:function(e){return e.preventDefault(),t.selectBeatmap()}}},[i("i",{staticClass:"far fa-window-maximize"})])]):t._e(),t._v(" "),t.notification.party?i("span",[t._v('\n                for quest "'+t._s(t.notification.quest.name)+'"\n                '),i("a",{staticClass:"text-done",attrs:{href:"#","data-user":t.notification.party.id,"data-toggle":"modal","data-target":"#limitedEditParty"},on:{click:function(e){return e.preventDefault(),t.selectParty()}}},[i("i",{staticClass:"far fa-window-maximize"})])]):t._e()]),t._v(" "),i("hr"),t._v(" "),i("div",{staticClass:"d-flex justify-content-between align-items-center"},[i("span",{staticClass:"card-text small"},[t._v(t._s(t.notification.createdAt.slice(0,10)))]),t._v(" "),i("button",{staticClass:"btn btn-outline-info btn-sm",on:{click:function(e){return e.preventDefault(),t.hideNotification(e)}}},[t._v("\n                Mark as read\n            ")])])])])};o._withStripped=!0;const r=s().extend({name:"NotificationCard",props:{notification:{type:Object,required:!0}},methods:{hideNotification(t){this.$emit("hide-notification",{id:this.notification.id,e:t})},selectBeatmap(){this.$emit("update:selectedMap",this.notification.map)},selectParty(){this.$emit("update:selectedParty",this.notification.party)}}});var c=i(1900),l=(0,c.Z)(r,o,[],!1,null,null,null);l.options.__file="src/components/notifications/NotificationCard.vue";const d=l.exports;var u=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"col-md-12 my-1"},[i("div",{staticClass:"card card-body card-level-2 p-2"},[i("div",{staticClass:"card-text small"},[i("a",{attrs:{href:"https://osu.ppy.sh/users/"+t.invite.sender.osuId,target:"_blank"},on:{click:function(t){t.stopPropagation()}}},[t._v("\n                "+t._s(t.invite.sender.username)+"\n            ")]),t._v("\n\n            "+t._s(t.invite.info)+"\n\n            "),t.invite.map?i("span",[t.invite.map.url?i("span",[i("a",{attrs:{href:t.invite.map.url,target:"_blank"}},[t._v(t._s(t.invite.map.song.artist)+" - "+t._s(t.invite.map.song.title))])]):i("span",[t._v(t._s(t.invite.map.song.artist)+" - "+t._s(t.invite.map.song.title))]),t._v(" "),i("a",{staticClass:"text-done",attrs:{href:"#","data-user":t.invite.map.id,"data-toggle":"modal","data-target":"#limitedEditBeatmap"},on:{click:function(e){return e.preventDefault(),t.selectBeatmap()}}},[i("i",{staticClass:"far fa-window-maximize"})])]):t._e(),t._v(" "),t.invite.party?i("span",[t._v('for quest "'+t._s(t.invite.quest.name)+'" '),i("a",{staticClass:"text-done",attrs:{href:"#","data-user":t.invite.party.id,"data-toggle":"modal","data-target":"#limitedEditParty"},on:{click:function(e){return e.preventDefault(),t.selectParty()}}},[i("i",{staticClass:"far fa-window-maximize"})])]):t._e()]),t._v(" "),i("hr"),t._v(" "),i("div",{staticClass:"d-flex justify-content-between align-items-center"},[i("span",{staticClass:"card-text small"},[t._v(t._s(t.invite.createdAt.toString().slice(0,10)))]),t._v(" "),i("span",{staticClass:"text-danger small"},[t._v(t._s(t.info))]),t._v(" "),i("div",[i("button",{staticClass:"btn btn-outline-danger btn-sm mx-1",on:{click:function(e){return e.preventDefault(),t.hideInvite(e)}}},[t._v("\n                    Decline\n                ")]),t._v(" "),i("button",{staticClass:"btn btn-outline-info btn-sm",on:{click:function(e){return e.preventDefault(),t.acceptInvite(e)}}},[t._v("\n                    Accept\n                ")])])])])])};u._withStripped=!0;const p=s().extend({name:"InviteCard",props:{invite:{type:Object,required:!0}},data:()=>({info:""}),methods:{selectBeatmap(){this.$emit("update:selectedMap",this.invite.map)},selectParty(){this.$emit("update:selectedParty",this.invite.party)},hideInvite(t){this.$emit("hide-invite",{id:this.invite.id,e:t})},acceptInvite(t){return e=this,i=void 0,n=function*(){(yield this.executePost(`/invites/${this.invite.id}/accept`,{},t))&&this.$emit("hide-accepted-invite",{id:this.invite.id,e:t})},new((a=void 0)||(a=Promise))((function(t,s){function o(t){try{c(n.next(t))}catch(t){s(t)}}function r(t){try{c(n.throw(t))}catch(t){s(t)}}function c(e){var i;e.done?t(e.value):(i=e.value,i instanceof a?i:new a((function(t){t(i)}))).then(o,r)}c((n=n.apply(e,i||[])).next())}));var e,i,a,n}}});var f=(0,c.Z)(p,u,[],!1,null,null,null);f.options.__file="src/components/notifications/InviteCard.vue";const v=f.exports;var m=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("modal-dialog",{attrs:{id:"limitedEditBeatmap","modal-size":"md","header-class":t.beatmap?"bg-"+t.beatmap.status.toLowerCase():"",loaded:Boolean(t.beatmap)},scopedSlots:t._u([{key:"header",fn:function(){return[t._v("\n        "+t._s(t.beatmap.song.artist)+" - "+t._s(t.beatmap.song.title)+" ("+t._s(t.beatmap.host.username)+")\n        "),"taiko"==t.beatmap.mode?i("i",{staticClass:"fas fa-drum"}):"catch"==t.beatmap.mode?i("i",{staticClass:"fas fa-apple-alt"}):"mania"==t.beatmap.mode?i("i",{staticClass:"fas fa-stream"}):t._e()]},proxy:!0},{key:"default",fn:function(){return[i("div",{staticClass:"container"},[i("div",{staticClass:"row"},[i("div",{staticClass:"col-sm-12"},[i("table",{staticClass:"table table-sm"},[i("thead",[i("th",{attrs:{scope:"col"}},[t._v("\n                                Difficulty\n                            ")]),t._v(" "),i("th",{attrs:{scope:"col"}},[t._v("\n                                Mapper(s)\n                            ")]),t._v(" "),"Ranked"!=t.beatmap.status?i("th",{attrs:{scope:"col"}},[t._v("\n                                Status\n                            ")]):t._e()]),t._v(" "),i("transition-group",{attrs:{id:"difficulties",tag:"tbody",name:"list"}},t._l(t.beatmap.tasks,(function(e){return i("tr",{key:e.id,attrs:{id:e.id+"Row"}},[i("td",{attrs:{scope:"row"}},[t._v("\n                                    "+t._s(e.name)+"\n                                ")]),t._v(" "),i("td",{attrs:{scope:"row"}},[t._l(e.mappers,(function(a,n){return[i("a",{key:a.id,attrs:{href:"https://osu.ppy.sh/users/"+a.osuId,target:"_blank"}},[t._v("\n                                            "+t._s(t.listUser(a.username,n,e.mappers.length))+"\n                                        ")])]}))],2),t._v(" "),"Ranked"!=t.beatmap.status?i("td",{class:e.status.toLowerCase(),attrs:{scope:"row"}},[t._v("\n                                    "+t._s(e.status)+"\n                                ")]):t._e()])})),0)],1)])])])]},proxy:!0}])})};m._withStripped=!0;var _=i(1515),h=i(1107);const y=s().extend({name:"LimitedMapInfo",components:{ModalDialog:_.Z},props:{beatmap:{type:Object,required:!0}},computed:{sortTasks(){const t=Object.values(h.XE);return Object.assign({},this.beatmap).tasks.sort((function(e,i){return t.indexOf(e.name)-t.indexOf(i.name)}))}}});var b=(0,c.Z)(y,m,[],!1,null,null,null);b.options.__file="src/components/notifications/LimitedMapInfo.vue";const g=b.exports;var C=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("modal-dialog",{attrs:{id:"limitedEditParty","header-class":t.party?"bg-rank-"+t.party.rank:"",loaded:Boolean(t.party)},scopedSlots:t._u([{key:"header",fn:function(){return[t._v("\n        "+t._s(t.party.name)+"\n    ")]},proxy:!0},{key:"default",fn:function(){return[i("p",[t._v("\n            Members: ("),i("span",{class:t.party.id+"-member-count"},[t._v(t._s(t.party.members.length))]),t._v(")\n        ")]),t._v(" "),i("p",{staticStyle:{"margin-left":"20px"}},[t._l(t.party.members,(function(e,a){return[i("a",{key:a,attrs:{href:"https://osu.ppy.sh/users/"+e.osuId,target:"_blank"}},[t._v("\n                    "+t._s(t.listUser(e.username,a,t.party.members.length))+"\n                ")])]}))],2),t._v(" "),i("p",[t._v("\n            Leader: "),i("a",{attrs:{href:"https://osu.ppy.sh/users/"+t.party.leader.osuId,target:"_blank"}},[t._v(t._s(t.party.leader.username))])]),t._v(" "),i("p",[t._v("\n            Rank: "+t._s(t.party.rank)+"\n        ")])]},proxy:!0}])})};C._withStripped=!0;const k=s().extend({name:"LimitedPartyInfo",components:{ModalDialog:_.Z},props:{party:{type:Object,required:!0}}});var x=(0,c.Z)(k,C,[],!1,null,null,null);x.options.__file="src/components/notifications/LimitedPartyInfo.vue";const w=x.exports;var P=function(t,e,i,a){return new(i||(i=Promise))((function(n,s){function o(t){try{c(a.next(t))}catch(t){s(t)}}function r(t){try{c(a.throw(t))}catch(t){s(t)}}function c(t){var e;t.done?n(t.value):(e=t.value,e instanceof i?e:new i((function(t){t(e)}))).then(o,r)}c((a=a.apply(t,e||[])).next())}))};const I=s().extend({name:"NotificationPage",components:{NotificationCard:d,InviteCard:v,LimitedMapInfo:g,LimitedPartyInfo:w},data:()=>({notifications:[],invites:[],info:"",selectedMap:null,selectedParty:null}),created(){return P(this,void 0,void 0,(function*(){const t=yield this.initialRequest("/notifications/relevantInfo");t&&(this.notifications=t.notifications,this.invites=t.invites)}))},methods:{hideNotification(t){return P(this,void 0,void 0,(function*(){const e=t.id,i=t.e,a=this.notifications.findIndex((t=>t.id===e));this.notifications.splice(a,1),yield this.executePost(`/notifications/${e}/hide`,{},i)}))},hideAll(t){return P(this,void 0,void 0,(function*(){this.notifications=[],yield this.executePost("/notifications/hideAll/",{},t)}))},hideInvite(t){return P(this,void 0,void 0,(function*(){const e=t.id,i=t.e,a=this.invites.findIndex((t=>t.id===e));this.invites.splice(a,1),yield this.executePost(`/invites/${e}/hide`,{},i)}))},declineAll(t){return P(this,void 0,void 0,(function*(){this.invites=[],yield this.executePost("/invites/declineAll/",{},t)}))}}});var M=(0,c.Z)(I,a,[],!1,null,null,null);M.options.__file="src/pages/NotificationPage.vue";const D=M.exports}}]);