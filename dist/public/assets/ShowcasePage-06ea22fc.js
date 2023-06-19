import{d as w,m as y,_ as S,o as t,e as a,h as l,t as c,k as h,q as p,n as u,l as m,i as f,a as o,F as $,r as v,y as b,z as A,K as I}from"./index-098c3321.js";import{U as M}from"./UserLinkList-9825781f.js";const U={namespaced:!0,state:{showcaseArtists:[]},mutations:{setShowcaseArtists(s,e){s.showcaseArtists=e},updateArtist(s,e){const d=s.showcaseArtists.findIndex(g=>g.id===e.id);d!==-1&&(s.showcaseArtists[d]=e)}}},T=U,C=w({name:"SongDetails",components:{UserLinkList:M},props:{song:{type:Object,default:null},isShowcaseMapper:{type:Boolean},artistId:{type:String,required:!0}},data(){return{processing:!1}},computed:{...y(["loggedInUser"]),isSongShowcaseMapper(){return this.song.songShowcaseMappers.map(e=>e.id).includes(this.loggedInUser.id)}},methods:{async addSongShowcaseMapper(s){this.processing=!0;const e=await this.$http.executePost(`/showcase/addSongShowcaseMapper/${this.artistId}/${this.song.id}`,{},s);e&&!this.$http.isError(e)&&(this.$store.commit("showcase/updateArtist",e),this.$store.dispatch("updateToastMessages",{message:"Added",type:"info"})),this.processing=!1},async removeSongShowcaseMapper(s){this.processing=!0;const e=await this.$http.executePost(`/showcase/removeSongShowcaseMapper/${this.artistId}/${this.song.id}`,{},s);e&&!this.$http.isError(e)&&(this.$store.commit("showcase/updateArtist",e),this.$store.dispatch("updateToastMessages",{message:"Removed",type:"info"})),this.processing=!1}}});const D={key:0,class:"text-info"},R={key:1,class:"text-info"};function z(s,e,d,g,_,k){const r=f("user-link-list");return t(),a("div",null,[l(c(s.song.artist)+" - "+c(s.song.title)+" ",1),s.song.songShowcaseMappers&&s.song.songShowcaseMappers.length?(t(),a("span",D,[l(" (mapped by "),h(r,{users:s.song.songShowcaseMappers},null,8,["users"]),l(") ")])):p("",!0),s.isShowcaseMapper?(t(),a("span",R,[s.song.songShowcaseMappers&&s.isSongShowcaseMapper?(t(),a("a",{key:0,href:"#",class:u(["text-danger small",s.processing?"fake-button-disable":""]),onClick:e[0]||(e[0]=m(i=>s.removeSongShowcaseMapper(i),["prevent"]))}," remove ",2)):(t(),a("a",{key:1,href:"#",class:u(["text-success small",s.processing?"fake-button-disable":""]),onClick:e[1]||(e[1]=m(i=>s.addSongShowcaseMapper(i),["prevent"]))}," add ",2))])):p("",!0)])}const P=S(C,[["render",z],["__scopeId","data-v-0cce4eea"]]),j=w({name:"ArtistDetails",components:{UserLinkList:M,SongDetails:P},props:{artist:{type:Object,default:null}},data(){return{processing:!1}},computed:{...y(["loggedInUser"]),isShowcaseMapper(){return this.artist.showcaseMappers.map(e=>e.id).includes(this.loggedInUser.id)},month(){return this.artist.projectedRelease?new Date(this.artist.projectedRelease).toLocaleString("default",{month:"long"}):null}},methods:{async addShowcaseMapper(s){this.processing=!0;const e=await this.$http.executePost("/showcase/addShowcaseMapper/"+this.artist.id,{},s);e&&!this.$http.isError(e)&&(this.$store.commit("showcase/updateArtist",e),this.$store.dispatch("updateToastMessages",{message:"Added",type:"info"})),this.processing=!1},async removeShowcaseMapper(s){this.processing=!0;const e=await this.$http.executePost("/showcase/removeShowcaseMapper/"+this.artist.id,{},s);e&&!this.$http.isError(e)&&(this.$store.commit("showcase/updateArtist",e),this.$store.dispatch("updateToastMessages",{message:"Removed",type:"info"})),this.processing=!1}}});const E=s=>(b("data-v-a8a73f31"),s=s(),A(),s),F=["href"],N=E(()=>o("i",{class:"fas fa-angle-down"},null,-1)),V={class:"small"},B=["id"],L={class:"small ms-2"},q={key:0},O=["href"],Y={key:1},K={key:2},G=["href"],H={key:3},J={key:4},Q={key:5},W={key:6};function X(s,e,d,g,_,k){const r=f("user-link-list"),i=f("song-details");return t(),a("div",null,[o("a",{href:"#"+s.artist.label.replace(/\s|[0-9]/g,"")+"Artist","data-bs-toggle":"collapse",class:u(s.artist.hasRankedMaps?"":"text-warning")},[l(c(s.artist.label)+" ",1),N],10,F),l(" — "),o("span",V,[h(r,{users:s.artist.showcaseMappers},null,8,["users"])]),s.artist.showcaseMappers&&s.isShowcaseMapper?(t(),a("a",{key:0,href:"#",class:u(["text-danger small",s.processing?"fake-button-disable":""]),onClick:e[0]||(e[0]=m(n=>s.removeShowcaseMapper(n),["prevent"]))}," remove ",2)):(t(),a("a",{key:1,href:"#",class:u(["text-success small",s.processing?"fake-button-disable":""]),onClick:e[1]||(e[1]=m(n=>s.addShowcaseMapper(n),["prevent"]))}," add ",2)),o("div",{id:s.artist.label.replace(/\s|[0-9]/g,"")+"Artist",class:"collapse"},[o("div",L,[s.artist.referenceUrl?(t(),a("div",q,[s.artist.referenceUrl?(t(),a("a",{key:0,href:s.artist.referenceUrl,target:"_blank"},c(s.artist.referenceUrl),9,O)):p("",!0)])):p("",!0),s.artist.songs.length?s.artist.oszTemplatesUrl?(t(),a("div",K,[o("a",{href:s.artist.oszTemplatesUrl,target:"_blank"},".osz templates",8,G)])):(t(),a("div",H," .osz templates aren't available yet. :( ")):(t(),a("div",Y," Songs haven't been added yet. @pishifat ")),s.artist.projectedRelease?(t(),a("div",J,c(s.month)+" (deadline estimate) ",1)):(t(),a("div",Q," Deadline hasn't been set yet. ")),s.artist.offeredUsers&&s.artist.offeredUsers.length&&s.loggedInUser.group=="admin"?(t(),a("div",W,[l(" offered to "),h(r,{users:s.artist.offeredUsers},null,8,["users"])])):p("",!0)]),o("ul",null,[(t(!0),a($,null,v(s.artist.songs,n=>(t(),a("li",{key:n.id,class:"small text-secondary"},[h(i,{song:n,"is-showcase-mapper":s.isShowcaseMapper,"artist-id":s.artist.id},null,8,["song","is-showcase-mapper","artist-id"])]))),128))])],8,B)])}const Z=S(j,[["render",X],["__scopeId","data-v-a8a73f31"]]),x=w({name:"ShowcasePage",components:{ArtistDetails:Z},computed:{...y("showcase",["showcaseArtists"])},beforeCreate(){this.$store.hasModule("showcase")||this.$store.registerModule("showcase",T)},async created(){const s=await this.$http.initialRequest("/showcase/relevantInfo");s&&this.$store.commit("showcase/setShowcaseArtists",s.artists)}}),ss={class:"container card card-body py-3 mb-3"},es=I('<h5>readme.txt</h5><ol class="small text-secondary"><li> These are some of the Featured Artists planned to be announced in the next few months. This is not an exhaustive list of all upcoming Featured Artists, and some may not be announced until later. </li><li> As a *special showcase mapper person*, you&#39;re trusted to not leak anything on this page. So don&#39;t leak anything. </li><li> Clicking an artist will display their info + songs you can map. </li><li><span class="text-warning">Yellow</span> artists are desperate for new maps, and will likely feature your map in the announcement video (if you&#39;re the only mapper). </li><li> If you&#39;re interested mapping a song from an artist, mark it with <span class="text-success">add</span> (or <span class="text-danger">remove</span> if you change your mind). You can optionally mark a specific song too. pishifat will talk to you about the next steps once you&#39;ve expressed interest. </li><li> Deadlines are flexible. Talk to pishifat if you want to map an artist, but the deadline is holding you back. </li></ol><hr><h5>Upcoming Featured Artists</h5>',4),ts={key:0};function as(s,e,d,g,_,k){const r=f("artist-details");return t(),a("div",null,[o("div",ss,[es,o("ul",null,[(t(!0),a($,null,v(s.showcaseArtists,i=>(t(),a("li",{key:i.id},[h(r,{artist:i},null,8,["artist"])]))),128)),!s.showcaseArtists||!s.showcaseArtists.length?(t(),a("li",ts," You're not supposed to be here. Or something went wrong. Talk to pishifat if you're expecting a list of artists. ")):p("",!0)])])])}const rs=S(x,[["render",as]]);export{rs as default};
