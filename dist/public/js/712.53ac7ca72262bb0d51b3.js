(self.webpackChunkmappersguild=self.webpackChunkmappersguild||[]).push([[712],{3173:(t,e,a)=>{"use strict";a.d(e,{Z:()=>r});var s=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",[t.data.length?a("table",{staticClass:"table table-sm"},[a("thead",[t._l(t.headers,(function(e){return a("th",{key:e},[t._v("\n                "+t._s(e)+"\n            ")])})),t._v(" "),a("th",[t._v("EDIT")])],2),t._v(" "),a("tbody",t._l(t.data,(function(e){return a("tr",{key:e.id,staticClass:"text-white-50"},[t._t("default",null,{obj:e}),t._v(" "),a("td",[a("a",{attrs:{href:"#","data-toggle":"modal","data-target":t.customDataTarget||"#edit"},on:{click:function(a){return a.preventDefault(),t.$emit("update:selected-id",e.id)}}},[t._v("\n                        edit\n                    ")])])],2)})),0)]):t.isLoading?t._e():a("span",{staticClass:"text-white-50"},[t._v("None...")])])};s._withStripped=!0;var n=a(2934);const i=a.n(n)().extend({name:"DataTable",props:{data:{type:Array,required:!0},headers:{type:Array,required:!0},isLoading:Boolean,customDataTarget:{type:String,default:null}}});var o=(0,a(1900).Z)(i,s,[],!1,null,null,null);o.options.__file="src/components/admin/DataTable.vue";const r=o.exports},2155:(t,e,a)=>{"use strict";a.r(e),a.d(e,{default:()=>S});var s=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",[a("div",{staticClass:"container card card-body py-1"},[a("div",{staticClass:"row"},[a("div",{staticClass:"col-sm"},[a("button",{staticClass:"btn btn-sm btn-info btn-block",attrs:{"data-toggle":"modal","data-target":"#newsPost"}},[t._v("\n                    Create news post\n                ")]),t._v(" "),a("data-table",{attrs:{data:t.beatmaps,headers:["METADATA","PACK ID","STATUS"],"custom-data-target":"#editBeatmap"},on:{"update:selected-id":function(e){t.selectedBeatmapId=e}},scopedSlots:t._u([{key:"default",fn:function(e){var s=e.obj;return[a("td",{staticClass:"text-truncate"},["osu"==s.mode?a("i",{staticClass:"fas fa-circle"}):"taiko"==s.mode?a("i",{staticClass:"fas fa-drum"}):"catch"==s.mode?a("i",{staticClass:"fas fa-apple-alt"}):"mania"==s.mode?a("i",{staticClass:"fas fa-stream"}):t._e(),t._v(" "),s.url?a("a",{attrs:{href:s.url}},[t._v("\n                            "+t._s(t.formatMetadata(s.song))+"\n                        ")]):a("span",[t._v(t._s(t.formatMetadata(s.song)))])]),t._v(" "),a("td",[t._v("\n                        "+t._s(s.packId)+"\n                    ")]),t._v(" "),a("td",[t._v("\n                        "+t._s(s.status)+"\n                    ")])]}}])})],1)])]),t._v(" "),t.selectedBeatmap?a("beatmap-info-admin",{attrs:{beatmap:t.selectedBeatmap},on:{"update-beatmap":function(e){return t.updateBeatmap(e)}}}):t._e(),t._v(" "),a("news-post"),t._v(" "),a("bundled-beatmaps-list"),t._v(" "),a("beatmap-pack-id-list-generator")],1)};s._withStripped=!0;var n=a(2934),i=a.n(n),o=a(6564),r=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("modal-dialog",{attrs:{id:"newsPost",title:"Generate news post"}},[a("p",[a("button",{staticClass:"btn btn-sm btn-outline-info",on:{click:function(e){return t.loadNewsInfo(e)}}},[t._v("\n            Load beatmap and quest data\n        ")]),t._v(" "),a("input",{directives:[{name:"model",rawName:"v-model",value:t.date,expression:"date"}],staticClass:"form-control form-control-sm mx-2 w-25",attrs:{type:"text",autocomplete:"off",placeholder:"YYYY-MM-DD"},domProps:{value:t.date},on:{input:function(e){e.target.composing||(t.date=e.target.value)}}})]),t._v(" "),a("p",[t._v("\n        notes to self from last news post:\n        - for the repeat packs (double, mini-pack, etc) they don't need to state the exact objective each time. too repetitive\n        - separate quests by type (special, big pack, mini pack, solo)\n        - not sure what to do about ranked maps list (probably too big each time? users is cool at least)\n    ")]),t._v(" "),t.quests?a("p",[t._v("\n        Quest data:\n    ")]):t._e(),t._v(" "),t.quests?a("copy-paste",{attrs:{distinct:"quests"}},t._l(t.quests,(function(e){return a("div",{key:e.id},[a("p",[t._v("\n                "+t._s(e.art&&e.associatedMaps.length?"!["+e.associatedMaps[0].song.artist+" header](https://assets.ppy.sh/artists/"+e.art+"/header.jpg)":"![Mystery header](/wiki/shared/news/banners/mappersguild-mystery.jpg)")+"\n            ")]),t._v(" "),a("p",[t._v("\n                For the **"+t._s(e.name+" ("+t.questModes(e.modes)+")")+"** quest, the mapper"+t._s(1==e.currentParty.members.length?"":"s")+" had to "+t._s(e.descriptionMain.substring(0,1).toLowerCase()+e.descriptionMain.substring(1))+"\n            ")]),t._v(" "),a("p",[t._v("\n                This quest was completed by\n                "),t._l(e.currentParty.members,(function(s,n){return a("span",{key:s.id},[t._v("\n                    **["+t._s(s.username)+"]("+t._s("https://osu.ppy.sh/users/"+s.osuId)+")**"+t._s(t.separateUsername(n,e.currentParty.members.length))+"\n                ")])}))],2),t._v(" "),t._l(e.associatedMaps,(function(s){return a("div",{key:s.id},[t._v("\n                - ["+t._s(s.song.artist)+" - "+t._s(s.song.title)+"]("+t._s(s.url)+")\n                "+t._s(t.hasMultipleMappers(s.tasks)?"hosted by":"by")+"\n                ["+t._s(s.host.username)+"]("+t._s("https://osu.ppy.sh/users/"+s.host.osuId)+")\n                "),e.modes.length>1?a("span",[t._v("\n                    ("+t._s("osu"==s.mode?"osu!":"hybrid"==s.mode?"hybrid":"osu!"+s.mode)+")\n                ")]):t._e()])})),t._v(" "),a("br")],2)})),0):t._e(),t._v(" "),t.beatmaps?a("p",[t._v("\n        Other beatmap data:\n    ")]):t._e(),t._v(" "),t.beatmaps?a("copy-paste",{attrs:{distinct:"beatmaps"}},[a("div",[t._v("[**osu!**](#osu)")]),t._v(" "),a("div",[t._v("[**osu!taiko**](#taiko)")]),t._v(" "),a("div",[t._v("[**osu!catch**](#catch)")]),t._v(" "),a("div",[t._v("[**osu!mania**](#mania)")]),t._v(" "),a("div",[t._v("[*Multiple mode mapsets**](#hybrid)")]),t._v(" "),a("br"),t._v(" "),a("beatmap-list",{attrs:{beatmaps:t.osuBeatmaps,"display-mode":"osu!","raw-mode":"osu"}}),t._v(" "),a("beatmap-list",{attrs:{beatmaps:t.taikoBeatmaps,"display-mode":"osu!taiko","raw-mode":"taiko"}}),t._v(" "),a("beatmap-list",{attrs:{beatmaps:t.catchBeatmaps,"display-mode":"osu!catch","raw-mode":"catch"}}),t._v(" "),a("beatmap-list",{attrs:{beatmaps:t.maniaBeatmaps,"display-mode":"osu!mania","raw-mode":"mania"}}),t._v(" "),a("beatmap-list",{attrs:{beatmaps:t.hybridBeatmaps,"display-mode":"multiple modes","raw-mode":"hybrid"}})],1):t._e(),t._v(" "),t.externalBeatmaps?a("p",[t._v("\n        External beatmaps (sort these manually):\n    ")]):t._e(),t._v(" "),t.externalBeatmaps?a("copy-paste",{attrs:{distinct:"external"}},t._l(t.externalBeatmaps,(function(e){return a("div",{key:e.osuId},[t._v("\n            - ["+t._s(e.artist)+" - "+t._s(e.title)+"]("+t._s("https://osu.ppy.sh/beatmapsets/"+e.osuId)+")\n            hosted by\n            ["+t._s(e.creator)+"]("+t._s("https://osu.ppy.sh/users/"+e.creatorOsuId)+")\n        ")])})),0):t._e(),t._v(" "),t.users?a("p",[t._v("\n        Users with ranked maps/tasks:\n    ")]):t._e(),t._v(" "),t.users?a("copy-paste",{attrs:{distinct:"users"}},[a("div",[t._v("\n            | User | Beatmaps Ranked | Difficulties Ranked |\n        ")]),t._v(" "),a("div",[t._v("\n            | :-- | :-- | :-- |\n        ")]),t._v(" "),t._l(t.users,(function(e){return a("div",{key:e.id},[t._v("\n            | ["+t._s(e.username)+"]("+t._s("https://osu.ppy.sh/users/"+e.osuId)+") | "+t._s(e.hostCount)+" | "+t._s(e.taskCount)+" |\n        ")])}))],2):t._e()],1)};r._withStripped=!0;var d=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",[a("p",[t._v("\n        ## "+t._s(t.navigation+t.displayMode)+"\n    ")]),t._v(" "),t._l(t.beatmaps,(function(e){return a("div",{key:e.id},[t._v("\n        - ["+t._s(e.song.artist)+" - "+t._s(e.song.title)+"]("+t._s(e.url)+")\n        "+t._s(t.hasUniqueMapper(e.tasks)?"by":"hosted by")+"\n        ["+t._s(e.host.username)+"]("+t._s("https://osu.ppy.sh/users/"+e.host.osuId)+")\n    ")])})),t._v(" "),a("br")],2)};d._withStripped=!0;const p=i().extend({name:"BeatmapList",props:{beatmaps:{type:Array,default:()=>[]},displayMode:{type:String,default:null},rawMode:{type:String,default:null}},computed:{navigation(){return'<a id="'+this.rawMode+'"></a>'}},methods:{hasUniqueMapper(t){let e="";for(const a of t)for(const t of a.mappers)if(e){if(e!==t.id)return!1}else e=t.id;return!0}}});var u=a(1900),l=(0,u.Z)(p,d,[],!1,null,null,null);l.options.__file="src/components/admin/newspost/BeatmapList.vue";const m=l.exports;var c=a(5030),_=a(1515);const v=i().extend({name:"NewsPost",components:{BeatmapList:m,CopyPaste:c.Z,ModalDialog:_.Z},data:()=>({date:"2020-03-23",beatmaps:[],quests:[],externalBeatmaps:[],users:[]}),computed:{osuBeatmaps(){return this.beatmaps.filter((t=>"osu"==t.mode))},taikoBeatmaps(){return this.beatmaps.filter((t=>"taiko"==t.mode))},catchBeatmaps(){return this.beatmaps.filter((t=>"catch"==t.mode))},maniaBeatmaps(){return this.beatmaps.filter((t=>"mania"==t.mode))},hybridBeatmaps(){return this.beatmaps.filter((t=>"hybrid"==t.mode))}},methods:{loadNewsInfo(t){return e=this,a=void 0,n=function*(){const e=yield this.executeGet("/admin/beatmaps/loadNewsInfo/"+this.date,t);e&&(this.beatmaps=e.beatmaps,this.quests=e.quests,this.externalBeatmaps=e.externalBeatmaps,this.users=e.users)},new((s=void 0)||(s=Promise))((function(t,i){function o(t){try{d(n.next(t))}catch(t){i(t)}}function r(t){try{d(n.throw(t))}catch(t){i(t)}}function d(e){var a;e.done?t(e.value):(a=e.value,a instanceof s?a:new s((function(t){t(a)}))).then(o,r)}d((n=n.apply(e,a||[])).next())}));var e,a,s,n},questModes(t){let e="";for(let a=0;a<t.length;a++){const s=t[a];e+="osu"==s?"osu!":"osu!"+s,a<t.length-1&&(e+=", ")}return e},separateUsername:(t,e)=>t<e-2?", ":t<e-1?" and":"",hasMultipleMappers(t){const e=[];return t.forEach((t=>{t.mappers.forEach((t=>{e.includes(t)||e.push(t)}))})),e.length>1}}});var h=(0,u.Z)(v,r,[],!1,null,null,null);h.options.__file="src/components/admin/newspost/NewsPost.vue";const f=h.exports;var b=a(1309),y=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"container card card-body py-1 mb-4"},[a("button",{staticClass:"btn btn-sm btn-block btn-outline-info",on:{click:function(e){return t.findBundledBeatmaps(e)}}},[t._v("\n        Load bundled beatmaps\n    ")]),t._v(" "),t.bundledBeatmaps.length?a("div",[a("p",[t._v("osu")]),t._v(" "),a("copy-paste",{attrs:{distinct:"osu"}},t._l(t.osuBeatmaps,(function(e){return a("div",{key:e.id},[t._v("\n                "+t._s(t.findOsuId(e.url))+"\n            ")])})),0),t._v(" "),a("p",[t._v("taiko")]),t._v(" "),a("copy-paste",{attrs:{distinct:"taiko"}},t._l(t.taikoBeatmaps,(function(e){return a("div",{key:e.id},[t._v("\n                "+t._s(t.findOsuId(e.url))+"\n            ")])})),0),t._v(" "),a("p",[t._v("catch")]),t._v(" "),a("copy-paste",{attrs:{distinct:"catch"}},t._l(t.catchBeatmaps,(function(e){return a("div",{key:e.id},[t._v("\n                "+t._s(t.findOsuId(e.url))+"\n            ")])})),0),t._v(" "),a("p",[t._v("mania")]),t._v(" "),a("copy-paste",{attrs:{distinct:"mania"}},t._l(t.maniaBeatmaps,(function(e){return a("div",{key:e.id},[t._v("\n                "+t._s(t.findOsuId(e.url))+"\n            ")])})),0)],1):t._e()])};y._withStripped=!0;const k=i().extend({name:"BundledBeatmapsList",components:{CopyPaste:c.Z},data:()=>({bundledBeatmaps:[]}),computed:{osuBeatmaps(){return this.bundledBeatmaps.filter((t=>"osu"==t.mode))},taikoBeatmaps(){return this.bundledBeatmaps.filter((t=>"taiko"==t.mode))},catchBeatmaps(){return this.bundledBeatmaps.filter((t=>"catch"==t.mode))},maniaBeatmaps(){return this.bundledBeatmaps.filter((t=>"mania"==t.mode))}},methods:{findBundledBeatmaps(t){return e=this,a=void 0,n=function*(){const e=yield this.executeGet("/admin/beatmaps/findBundledBeatmaps",t);e&&!e.error&&(this.bundledBeatmaps=e)},new((s=void 0)||(s=Promise))((function(t,i){function o(t){try{d(n.next(t))}catch(t){i(t)}}function r(t){try{d(n.throw(t))}catch(t){i(t)}}function d(e){var a;e.done?t(e.value):(a=e.value,a instanceof s?a:new s((function(t){t(a)}))).then(o,r)}d((n=n.apply(e,a||[])).next())}));var e,a,s,n},findOsuId(t){const e=t.indexOf("beatmapsets/")+"beatmapsets/".length,a=t.indexOf("#");let s="";return s=-1!==a?t.slice(e,a):t.slice(e),parseInt(s,10)}}});var B=(0,u.Z)(k,y,[],!1,null,null,null);B.options.__file="src/components/admin/BundledBeatmapsList.vue";const g=B.exports;var w=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"container card card-body py-1 mb-4"},[a("textarea",{directives:[{name:"model",rawName:"v-model",value:t.inputUrls,expression:"inputUrls"}],staticClass:"form-control form-control-sm mx-2 mt-2 w-100",attrs:{type:"text",autocomplete:"off",placeholder:"map URLs separated by newlines..."},domProps:{value:t.inputUrls},on:{input:function(e){e.target.composing||(t.inputUrls=e.target.value)}}}),t._v(" "),a("button",{staticClass:"btn btn-sm btn-block btn-outline-info",on:{click:function(e){return t.generateBeatmapPackIdList()}}},[t._v("\n        Generate beatmap pack ID list\n    ")]),t._v(" "),t.output.length?a("div",[a("copy-paste",[t._v("\n            "+t._s(t.output)+"\n        ")])],1):t._e()])};w._withStripped=!0;const I=i().extend({name:"BeatmapPackIdListGenerator",components:{CopyPaste:c.Z},data:()=>({inputUrls:"",output:""}),methods:{findOsuId(t){const e=t.indexOf("beatmapsets/")+"beatmapsets/".length,a=t.indexOf("#");let s="";return s=-1!==a?t.slice(e,a):t.slice(e),parseInt(s,10)},generateBeatmapPackIdList(){let t="";const e=this.inputUrls.split("\n");for(const a of e){const e=this.findOsuId(a);isNaN(e)?t+=`FAILED (${a})`:t+=e,t+=","}this.output=t.substring(0,t.length-1)}}});var x=(0,u.Z)(I,w,[],!1,null,null,null);x.options.__file="src/components/admin/BeatmapPackIdListGenerator.vue";const M=x.exports;var C=a(3173);const P={state:{beatmaps:[]},mutations:{setBeatmaps(t,e){t.beatmaps=e},updateBeatmapStatus(t,e){const a=t.beatmaps.find((t=>t.id==e.beatmapId));a&&(a.status=e.status)},deleteTask(t,e){const a=t.beatmaps.find((t=>t.id==e.beatmapId));if(a){const t=a.tasks.findIndex((t=>t.id==e.taskId));-1!==t&&a.tasks.splice(t,1)}},deleteModder(t,e){const a=t.beatmaps.find((t=>t.id==e.beatmapId));if(a){const t=a.modders.findIndex((t=>t.id==e.modderId));-1!==t&&a.modders.splice(t,1)}},updateUrl(t,e){const a=t.beatmaps.find((t=>t.id==e.beatmapId));a&&(a.url=e.url)},updateStoryboardQuality(t,e){const a=t.beatmaps.find((t=>t.id==e.beatmapId));if(a){const t=a.tasks.findIndex((t=>t.id==e.taskId));-1!==t&&i().set(a.tasks,t,e.task)}},updatePackId(t,e){const a=t.beatmaps.find((t=>t.id==e.beatmapId));a&&(a.packId=e.packId)},updateIsShowcase(t,e){const a=t.beatmaps.find((t=>t.id==e.beatmapId));a&&(a.isShowcase=e.isShowcase)}}};const q=i().extend({components:{NewsPost:f,DataTable:C.Z,BeatmapInfoAdmin:b.Z,BundledBeatmapsList:g,BeatmapPackIdListGenerator:M},data:()=>({selectedBeatmapId:""}),computed:Object.assign(Object.assign({},(0,o.rn)({beatmaps:t=>t.beatmapsAdmin.beatmaps})),{selectedBeatmap(){return this.beatmaps.find((t=>t.id===this.selectedBeatmapId))}}),beforeCreate(){this.$store.hasModule("beatmapsAdmin")||this.$store.registerModule("beatmapsAdmin",P)},destroyed(){this.$store.hasModule("beatmapsAdmin")&&this.$store.unregisterModule("beatmapsAdmin")},created(){return t=this,e=void 0,s=function*(){const t=yield this.initialRequest("/admin/beatmaps/load");this.isError(t)||this.$store.commit("setBeatmaps",t)},new((a=void 0)||(a=Promise))((function(n,i){function o(t){try{d(s.next(t))}catch(t){i(t)}}function r(t){try{d(s.throw(t))}catch(t){i(t)}}function d(t){var e;t.done?n(t.value):(e=t.value,e instanceof a?e:new a((function(t){t(e)}))).then(o,r)}d((s=s.apply(t,e||[])).next())}));var t,e,a,s},methods:{updateBeatmap(t){const e=this.beatmaps.findIndex((e=>e.id==t.id));-1!==e&&i().set(this.beatmaps,e,t)},formatMetadata(t){if(!t)return"";let e=t.artist+" - ";return t.title.length>40?e+=t.title.slice(0,40)+"...":e+=t.title,e}}});var L=(0,u.Z)(q,s,[],!1,null,null,null);L.options.__file="src/pages/admin/BeatmapPage.vue";const S=L.exports}}]);