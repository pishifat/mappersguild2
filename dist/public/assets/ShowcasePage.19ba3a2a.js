var s=Object.defineProperty,e=Object.defineProperties,t=Object.getOwnPropertyDescriptors,a=Object.getOwnPropertySymbols,r=Object.prototype.hasOwnProperty,i=Object.prototype.propertyIsEnumerable,o=(e,t,a)=>t in e?s(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a,n=(s,e)=>{for(var t in e||(e={}))r.call(e,t)&&o(s,t,e[t]);if(a)for(var t of a(e))i.call(e,t)&&o(s,t,e[t]);return s},l=(s,a)=>e(s,t(a));import{d as p,m as c,p as d,a as h,h as g,o as u,b as m,k as f,t as w,j as y,e as b,n as v,q as k,f as S,F as M,g as x,x as A}from"./vendor.b9ef672a.js";import{_ as $}from"./UserLinkList.9aab0eb3.js";var U={namespaced:!0,state:{showcaseArtists:[]},mutations:{setShowcaseArtists(s,e){s.showcaseArtists=e},updateArtist(s,e){const t=s.showcaseArtists.findIndex((s=>s.id===e.id));-1!==t&&(s.showcaseArtists[t]=e)}}},j=p({name:"SongDetails",components:{UserLinkList:$},props:{song:{type:Object,default:null},isShowcaseMapper:{type:Boolean},artistId:{type:String,required:!0}},data:()=>({processing:!1}),computed:l(n({},c(["loggedInUser"])),{isSongShowcaseMapper(){return this.song.songShowcaseMappers.map((s=>s.id)).includes(this.loggedInUser.id)}}),methods:{async addSongShowcaseMapper(s){this.processing=!0;const e=await this.$http.executePost(`/showcase/addSongShowcaseMapper/${this.artistId}/${this.song.id}`,{},s);e&&!this.$http.isError(e)&&(this.$store.commit("showcase/updateArtist",e),this.$store.dispatch("updateToastMessages",{message:"Added",type:"info"})),this.processing=!1},async removeSongShowcaseMapper(s){this.processing=!0;const e=await this.$http.executePost(`/showcase/removeSongShowcaseMapper/${this.artistId}/${this.song.id}`,{},s);e&&!this.$http.isError(e)&&(this.$store.commit("showcase/updateArtist",e),this.$store.dispatch("updateToastMessages",{message:"Removed",type:"info"})),this.processing=!1}}});d("data-v-17e86fb0");const I={key:0,class:"text-info"},O=f(" (mapped by "),P=f(") "),T={key:1,class:"text-info"};h(),j.render=function(s,e,t,a,r,i){const o=g("user-link-list");return u(),m("div",null,[f(w(s.song.artist)+" - "+w(s.song.title)+" ",1),s.song.songShowcaseMappers&&s.song.songShowcaseMappers.length?(u(),m("span",I,[O,y(o,{users:s.song.songShowcaseMappers},null,8,["users"]),P])):b("",!0),s.isShowcaseMapper?(u(),m("span",T,[s.song.songShowcaseMappers&&s.isSongShowcaseMapper?(u(),m("a",{key:0,href:"#",class:v(["text-danger small",s.processing?"fake-button-disable":""]),onClick:e[0]||(e[0]=k((e=>s.removeSongShowcaseMapper(e)),["prevent"]))}," remove ",2)):(u(),m("a",{key:1,href:"#",class:v(["text-success small",s.processing?"fake-button-disable":""]),onClick:e[1]||(e[1]=k((e=>s.addSongShowcaseMapper(e)),["prevent"]))}," add ",2))])):b("",!0)])},j.__scopeId="data-v-17e86fb0";var D=p({name:"ArtistDetails",components:{UserLinkList:$,SongDetails:j},props:{artist:{type:Object,default:null}},data:()=>({processing:!1}),computed:l(n({},c(["loggedInUser"])),{isShowcaseMapper(){return this.artist.showcaseMappers.map((s=>s.id)).includes(this.loggedInUser.id)},month(){if(this.artist.projectedRelease){return new Date(this.artist.projectedRelease).toLocaleString("default",{month:"long"})}return null}}),methods:{async addShowcaseMapper(s){this.processing=!0;const e=await this.$http.executePost("/showcase/addShowcaseMapper/"+this.artist.id,{},s);e&&!this.$http.isError(e)&&(this.$store.commit("showcase/updateArtist",e),this.$store.dispatch("updateToastMessages",{message:"Added",type:"info"})),this.processing=!1},async removeShowcaseMapper(s){this.processing=!0;const e=await this.$http.executePost("/showcase/removeShowcaseMapper/"+this.artist.id,{},s);e&&!this.$http.isError(e)&&(this.$store.commit("showcase/updateArtist",e),this.$store.dispatch("updateToastMessages",{message:"Removed",type:"info"})),this.processing=!1}}});d("data-v-82100790");const L=["href"],R=S("i",{class:"fas fa-angle-down"},null,-1),_=f(" — "),C={class:"small"},E=["id"],z={class:"small ms-2"},F={key:0},q=["href"],Y={key:1},B={key:2},G=["href"],H={key:3},J={key:4},K={key:5},N={key:6},Q=f(" offered to ");h(),D.render=function(s,e,t,a,r,i){const o=g("user-link-list"),n=g("song-details");return u(),m("div",null,[S("a",{href:"#"+s.artist.label.replace(/\s|[0-9]/g,"")+"Artist","data-bs-toggle":"collapse",class:v(s.artist.hasRankedMaps?"":"text-warning")},[f(w(s.artist.label)+" ",1),R],10,L),_,S("span",C,[y(o,{users:s.artist.showcaseMappers},null,8,["users"])]),s.artist.showcaseMappers&&s.isShowcaseMapper?(u(),m("a",{key:0,href:"#",class:v(["text-danger small",s.processing?"fake-button-disable":""]),onClick:e[0]||(e[0]=k((e=>s.removeShowcaseMapper(e)),["prevent"]))}," remove ",2)):(u(),m("a",{key:1,href:"#",class:v(["text-success small",s.processing?"fake-button-disable":""]),onClick:e[1]||(e[1]=k((e=>s.addShowcaseMapper(e)),["prevent"]))}," add ",2)),S("div",{id:s.artist.label.replace(/\s|[0-9]/g,"")+"Artist",class:"collapse"},[S("div",z,[s.artist.referenceUrl?(u(),m("div",F,[s.artist.referenceUrl?(u(),m("a",{key:0,href:s.artist.referenceUrl,target:"_blank"},w(s.artist.referenceUrl),9,q)):b("",!0)])):b("",!0),s.artist.songs.length?s.artist.oszTemplatesUrl?(u(),m("div",B,[S("a",{href:s.artist.oszTemplatesUrl,target:"_blank"},".osz templates",8,G)])):(u(),m("div",H," .osz templates aren't available yet. :( ")):(u(),m("div",Y," Songs haven't been added yet. @pishifat ")),s.artist.projectedRelease?(u(),m("div",J,w(s.month)+" (deadline estimate) ",1)):(u(),m("div",K," Deadline hasn't been set yet. ")),s.artist.offeredUsers&&s.artist.offeredUsers.length&&"admin"==s.loggedInUser.group?(u(),m("div",N,[Q,y(o,{users:s.artist.offeredUsers},null,8,["users"])])):b("",!0)]),S("ul",null,[(u(!0),m(M,null,x(s.artist.songs,(e=>(u(),m("li",{key:e.id,class:"small text-secondary"},[y(n,{song:e,"is-showcase-mapper":s.isShowcaseMapper,"artist-id":s.artist.id},null,8,["song","is-showcase-mapper","artist-id"])])))),128))])],8,E)])},D.__scopeId="data-v-82100790";var V=p({name:"ShowcasePage",components:{ArtistDetails:D},computed:n({},c("showcase",["showcaseArtists"])),beforeCreate(){this.$store.hasModule("showcase")||this.$store.registerModule("showcase",U)},async created(){const s=await this.$http.initialRequest("/showcase/relevantInfo");s&&this.$store.commit("showcase/setShowcaseArtists",s.artists)}});const W={class:"container card card-body py-3 mb-3"},X=A('<h5>readme.txt</h5><ol class="small text-secondary"><li> These are some of the Featured Artists planned to be announced in the next few months. This is not an exhaustive list of all upcoming Featured Artists, and some may not be announced until later. </li><li> As a *special showcase mapper person*, you&#39;re trusted to not leak anything on this page. So don&#39;t leak anything. </li><li> Clicking an artist will display their info + songs you can map. </li><li><span class="text-warning">Yellow</span> artists are desperate for new maps, and will likely feature your map in the announcement video (if you&#39;re the only mapper). </li><li> If you&#39;re interested mapping a song from an artist, mark it with <span class="text-success">add</span> (or <span class="text-danger">remove</span> if you change your mind). You can optionally mark a specific song too. pishifat will talk to you about the next steps once you&#39;ve expressed interest. </li><li> Deadlines are flexible. Talk to pishifat if you want to map an artist, but the deadline is holding you back. </li></ol><hr><h5>Upcoming Featured Artists</h5>',4),Z={key:0};V.render=function(s,e,t,a,r,i){const o=g("artist-details");return u(),m("div",null,[S("div",W,[X,S("ul",null,[(u(!0),m(M,null,x(s.showcaseArtists,(s=>(u(),m("li",{key:s.id},[y(o,{artist:s},null,8,["artist"])])))),128)),s.showcaseArtists&&s.showcaseArtists.length?b("",!0):(u(),m("li",Z," You're not supposed to be here. Or something went wrong. Talk to pishifat if you're expecting a list of artists. "))])])])};export{V as default};