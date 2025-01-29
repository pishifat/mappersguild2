import{M as w}from"./ModalDialog-eee53abc.js";import{d as y,U as S,_ as v,o as a,c as I,w as g,e as d,t as r,j as l,a as i,b as o,f as n,g as u,v as A,i as m,k as f,r as T,F as k,p}from"./index-eb01d7f8.js";const C=y({name:"FeaturedArtistInfo",components:{ModalDialog:w,UserLinkList:S},props:{featuredArtist:{type:Object,default:null}},data(){return{osuId:0,name:"",status:"",referenceUrl:"",oszTemplatesUrl:"",offeredUsers:"",selectedSong:null,artist:"",title:"",oszUrl:"",notes:"",classifiedStatus:"",classifiedUser:null}},computed:{alphabeticalSongs(){return[...this.featuredArtist.songs].sort((e,t)=>e.title.toLowerCase()>t.title.toLowerCase()?1:t.title.toLowerCase()>e.title.toLowerCase()?-1:0)}},watch:{featuredArtist(){this.osuId=this.featuredArtist.osuId,this.name=this.featuredArtist.label,this.status=this.featuredArtist.status,this.referenceUrl=this.featuredArtist.referenceUrl,this.oszTemplatesUrl=this.featuredArtist.oszTemplatesUrl,this.offeredUsers=this.generateUserListText(this.featuredArtist.offeredUsers),this.title="",this.notes=this.featuredArtist.notes},async selectedSong(){if(this.selectedSong){this.classifiedStatus="",this.classifiedUser=null,this.artist=this.selectedSong.artist,this.title=this.selectedSong.title,this.oszUrl=this.selectedSong.oszUrl;const e=await this.$http.executeGet(`/admin/featuredArtists/${this.selectedSong.id}/findClassifiedStatus`);this.$http.isError(e)||(this.classifiedStatus=e.message,this.classifiedUser=e.user)}}},methods:{generateUserListText(e){let t="";return!e||!e.length?t:e.map(h=>h.username).join(", ")},async updateOsuId(e){const t=await this.$http.executePost(`/admin/featuredArtists/${this.featuredArtist.id}/updateOsuId`,{osuId:this.osuId},e);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:"updated osu id",type:"info"}),this.$store.commit("updateOsuId",{featuredArtistId:this.featuredArtist.id,osuId:t})),await this.$http.executePost("/artists/toggleIsUpToDate/"+this.featuredArtist.id,{value:!0})},async updateName(e){const t=await this.$http.executePost(`/admin/featuredArtists/${this.featuredArtist.id}/updateName`,{name:this.name},e);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:"updated name",type:"info"}),this.$store.commit("updateName",{featuredArtistId:this.featuredArtist.id,name:t}))},async updateStatus(e){const t=await this.$http.executePost(`/admin/featuredArtists/${this.featuredArtist.id}/updateStatus`,{status:this.status},e);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:"updated status",type:"info"}),this.$store.commit("updateStatus",{featuredArtistId:this.featuredArtist.id,status:t}))},async updateReferenceUrl(e){const t=await this.$http.executePost(`/admin/featuredArtists/${this.featuredArtist.id}/updateReferenceUrl`,{referenceUrl:this.referenceUrl},e);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:"updated reference URL",type:"info"}),this.$store.commit("updateReferenceUrl",{featuredArtistId:this.featuredArtist.id,referenceUrl:t}))},async updateOszTemplatesUrl(e){const t=await this.$http.executePost(`/admin/featuredArtists/${this.featuredArtist.id}/updateOszTemplatesUrl`,{oszTemplatesUrl:this.oszTemplatesUrl},e);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:"updated osz templates URL",type:"info"}),this.$store.commit("updateOszTemplatesUrl",{featuredArtistId:this.featuredArtist.id,oszTemplatesUrl:t}))},async updateOfferedUsers(e){const t=await this.$http.executePost(`/admin/featuredArtists/${this.featuredArtist.id}/updateOfferedUsers`,{offeredUsers:this.offeredUsers},e);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:"updated offered users",type:"info"}),this.$store.commit("updateOfferedUsers",{featuredArtistId:this.featuredArtist.id,offeredUsers:t}))},async addSong(e){const t=await this.$http.executePost(`/admin/featuredArtists/${this.featuredArtist.id}/songs/create`,{artist:this.artist,title:this.title,oszUrl:this.oszUrl},e);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:"added song",type:"info"}),this.$store.commit("addSong",{featuredArtistId:this.featuredArtist.id,song:t}))},async editSong(e){if(!this.selectedSong){this.$store.dispatch("updateToastMessages",{message:"Select a song"});return}const t=await this.$http.executePost(`/admin/featuredArtists/${this.featuredArtist.id}/songs/${this.selectedSong.id}/update`,{artist:this.artist,title:this.title,oszUrl:this.oszUrl},e);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:"updated song",type:"info"}),this.$store.commit("updateSong",{featuredArtistId:this.featuredArtist.id,song:t}))},async toggleIsExcludedFromClassified(e){if(!this.selectedSong){this.$store.dispatch("updateToastMessages",{message:"Select a song"});return}const t=await this.$http.executePost(`/admin/featuredArtists/${this.featuredArtist.id}/songs/${this.selectedSong.id}/toggleIsExcludedFromClassified`,{isExcludedFromClassified:this.selectedSong.isExcludedFromClassified},e);this.$http.isError(t)||(this.classifiedStatus="",this.classifiedUser=null,this.$store.dispatch("updateToastMessages",{message:"updated classified inclusion status",type:"info"}),this.$store.commit("updateSong",{featuredArtistId:this.featuredArtist.id,song:t}))},async deleteSong(e){if(!this.selectedSong){this.$store.dispatch("updateToastMessages",{message:"Select a song"});return}const t=await this.$http.executePost(`/admin/featuredArtists/${this.featuredArtist.id}/songs/${this.selectedSong.id}/delete`,{},e);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:"deleted song",type:"info"}),this.$store.commit("deleteSong",{featuredArtistId:this.featuredArtist.id,songId:this.selectedSong.id}))},async updateNotes(e){const t=await this.$http.executePost(`/admin/featuredArtists/${this.featuredArtist.id}/updateNotes`,{notes:this.notes},e);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:"updated review comment",type:"info"}),this.$store.commit("updateNotes",{featuredArtistId:this.featuredArtist.id,notes:t}))},async updateLastReviewed(e){const t=await this.$http.executePost(`/admin/featuredArtists/${this.featuredArtist.id}/updateLastReviewed`,{},e);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:"updated last reviewed",type:"info"}),this.$store.commit("updateLastReviewed",{featuredArtistId:this.featuredArtist.id,lastReviewed:t}))},async updatePermanentlyDismiss(e){const t=await this.$http.executePost(`/admin/featuredArtists/${this.featuredArtist.id}/togglePermanentlyDismiss`,{},e);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:`updated permanenlty dismiss: ${t}`,type:"info"}),this.$store.commit("updatePermanentlyDismiss",{featuredArtistId:this.featuredArtist.id,permanentlyDismiss:t}))}}}),z=["href"],E={key:1},M={class:"container"},P=i("h5",null,"General",-1),L={class:"row mb-2 mx-1"},N={class:"row mb-2 mx-1"},O={class:"row mb-2 mx-1"},R=i("option",{value:"public"}," Public ",-1),V=i("option",{value:"private"}," Private ",-1),D=i("option",{value:"showcase"}," Showcase ",-1),F=i("option",{value:"playlist"}," Playlist ",-1),K=[R,V,D,F],x=i("hr",null,null,-1),B=i("h5",null,"Showcase info",-1),j={class:"row mb-2 mx-1"},G={class:"row mb-2 mx-1"},q={class:"row mb-2 mx-1"},H={key:0,class:"small mx-4"},J={key:1,class:"small mx-4"},Q=i("hr",null,null,-1),W=i("h5",null,"Songs",-1),X={class:"row mb-2 mx-2 w-50"},Y=["value"],Z={class:"row mb-2 mx-2"},_={class:"row mb-2 mx-2"},tt={class:"row mb-2 mx-2"},et={class:"mx-1"},st={key:0,class:"small text-secondary"},it={key:2,class:"mx-2 mt-2"},ot=i("b",null,"Classified status:",-1),at={key:0},rt=i("hr",null,null,-1),dt=i("h5",null,"Notes",-1),nt={class:"row mb-2 mx-1"},lt={class:"row mb-2"},ut={class:"col-sm-6"},ft={class:"text-secondary"},mt={class:"row mb-2"},pt={class:"col-sm-6"},ht={class:"text-danger me-2"};function ct(e,t,$,h,gt,At){const c=p("user-link-list"),U=p("user-link"),b=p("modal-dialog");return a(),I(b,{id:"editFeaturedArtist",loaded:!!e.featuredArtist},{header:g(()=>[e.featuredArtist.osuId?(a(),d("a",{key:0,href:"https://osu.ppy.sh/beatmaps/artists/"+e.featuredArtist.osuId,target:"_blank"},r(e.featuredArtist.label),9,z)):(a(),d("span",E,r(e.featuredArtist.label),1)),l(" ("+r(e.featuredArtist.songs.length)+") ",1)]),default:g(()=>[i("div",M,[P,i("div",L,[o(i("input",{"onUpdate:modelValue":t[0]||(t[0]=s=>e.osuId=s),class:"form-control form-control-sm mx-2 w-50",type:"text",autocomplete:"off",placeholder:"osu id...",onKeyup:t[1]||(t[1]=u(s=>e.updateOsuId(s),["enter"]))},null,544),[[n,e.osuId]]),i("button",{class:"btn btn-sm btn-outline-info w-25",onClick:t[2]||(t[2]=s=>e.updateOsuId(s))}," Save osu! ID ")]),i("div",N,[o(i("input",{"onUpdate:modelValue":t[3]||(t[3]=s=>e.name=s),class:"form-control form-control-sm mx-2 w-50",type:"text",autocomplete:"off",placeholder:"artist name...",onKeyup:t[4]||(t[4]=u(s=>e.updateName(s),["enter"]))},null,544),[[n,e.name]]),i("button",{class:"btn btn-sm btn-outline-info w-25",onClick:t[5]||(t[5]=s=>e.updateName(s))}," Save name ")]),i("div",O,[o(i("select",{"onUpdate:modelValue":t[6]||(t[6]=s=>e.status=s),class:"form-select form-select-sm w-50 mx-2"},K,512),[[A,e.status]]),i("button",{class:"btn btn-sm btn-outline-info w-25",onClick:t[7]||(t[7]=s=>e.updateStatus(s))}," Save status ")]),x,B,i("div",j,[o(i("input",{"onUpdate:modelValue":t[8]||(t[8]=s=>e.referenceUrl=s),class:"form-control form-control-sm mx-2 w-50",type:"text",autocomplete:"off",placeholder:"artist reference url...",onKeyup:t[9]||(t[9]=u(s=>e.updateReferenceUrl(s),["enter"]))},null,544),[[n,e.referenceUrl]]),i("button",{class:"btn btn-sm btn-outline-info w-25",onClick:t[10]||(t[10]=s=>e.updateReferenceUrl(s))}," Save reference URL ")]),i("div",G,[o(i("input",{"onUpdate:modelValue":t[11]||(t[11]=s=>e.oszTemplatesUrl=s),class:"form-control form-control-sm mx-2 w-50",type:"text",autocomplete:"off",placeholder:"osz templates url...",onKeyup:t[12]||(t[12]=u(s=>e.updateOszTemplatesUrl(s),["enter"]))},null,544),[[n,e.oszTemplatesUrl]]),i("button",{class:"btn btn-sm btn-outline-info w-25",onClick:t[13]||(t[13]=s=>e.updateOszTemplatesUrl(s))}," Save .osz templates URL ")]),i("div",q,[o(i("input",{"onUpdate:modelValue":t[14]||(t[14]=s=>e.offeredUsers=s),class:"form-control form-control-sm mx-2 w-50",type:"text",autocomplete:"off",placeholder:"offered user usernames...",onKeyup:t[15]||(t[15]=u(s=>e.updateOfferedUsers(s),["enter"]))},null,544),[[n,e.offeredUsers]]),i("button",{class:"btn btn-sm btn-outline-info w-25",onClick:t[16]||(t[16]=s=>e.updateOfferedUsers(s))}," Save offered users ")]),e.featuredArtist.offeredUsers&&e.featuredArtist.offeredUsers.length?(a(),d("div",H,[l(" offered: "),m(c,{users:e.featuredArtist.offeredUsers},null,8,["users"])])):f("",!0),e.featuredArtist.showcaseMappers&&e.featuredArtist.showcaseMappers.length?(a(),d("div",J,[l(" showcase mappers: "),m(c,{users:e.featuredArtist.showcaseMappers},null,8,["users"])])):f("",!0),Q,W,i("div",X,[o(i("select",{id:"editSongSelection","onUpdate:modelValue":t[17]||(t[17]=s=>e.selectedSong=s),class:"form-select form-select-sm"},[(a(!0),d(k,null,T(e.alphabeticalSongs,s=>(a(),d("option",{key:s.id,value:s},r(s.title)+" --- ("+r(s.artist)+") ",9,Y))),128))],512),[[A,e.selectedSong]])]),i("div",Z,[o(i("input",{"onUpdate:modelValue":t[18]||(t[18]=s=>e.artist=s),class:"form-control form-control-sm w-75",type:"text",autocomplete:"off",placeholder:"artist..."},null,512),[[n,e.artist]])]),i("div",_,[o(i("input",{"onUpdate:modelValue":t[19]||(t[19]=s=>e.title=s),class:"form-control form-control-sm w-75",type:"text",autocomplete:"off",placeholder:"title..."},null,512),[[n,e.title]])]),i("div",tt,[o(i("input",{"onUpdate:modelValue":t[20]||(t[20]=s=>e.oszUrl=s),class:"form-control form-control-sm w-75",type:"text",autocomplete:"off",placeholder:"osz template download link"},null,512),[[n,e.oszUrl]])]),i("div",et,[i("button",{class:"btn btn-sm btn-outline-info mx-1",onClick:t[21]||(t[21]=s=>e.addSong(s))}," Add song "),i("button",{class:"btn btn-sm btn-outline-info mx-1",onClick:t[22]||(t[22]=s=>e.editSong(s))}," Edit song "),i("button",{class:"btn btn-sm btn-outline-danger mx-1",onClick:t[23]||(t[23]=s=>e.deleteSong(s))}," Delete song "),e.selectedSong?(a(),d("span",st,r(e.selectedSong.id),1)):f("",!0)]),e.selectedSong&&e.classifiedStatus?(a(),d("div",it,[ot,l(" "+r(e.classifiedStatus)+" ",1),e.classifiedUser?(a(),d("span",at,[m(U,{user:e.classifiedUser},null,8,["user"])])):f("",!0),i("button",{class:"btn btn-sm btn-outline-danger mx-1",onClick:t[24]||(t[24]=s=>e.toggleIsExcludedFromClassified(s))},r(e.selectedSong.isExcludedFromClassified?"Add to Classified":"Exclude from Classified"),1)])):f("",!0),rt,dt,i("div",nt,[o(i("input",{"onUpdate:modelValue":t[25]||(t[25]=s=>e.notes=s),class:"form-control form-control-sm mx-2 w-50",type:"text",autocomplete:"off",placeholder:"notes...",onKeyup:t[26]||(t[26]=u(s=>e.updateNotes(s),["enter"]))},null,544),[[n,e.notes]]),i("button",{class:"btn btn-sm btn-outline-info w-25",onClick:t[27]||(t[27]=s=>e.updateNotes(s))}," Update notes ")]),i("div",lt,[i("span",ut,[l(" Last reviewed: "),i("span",ft,r(new Date(e.featuredArtist.lastReviewed)||"Never"),1)]),i("button",{class:"btn btn-sm btn-outline-info ms-3 w-25",onClick:t[28]||(t[28]=s=>e.updateLastReviewed(s))}," Set as today ")]),i("div",mt,[i("span",pt,[l(" Permanently dismissed: "),i("span",ht,r(e.featuredArtist.permanentlyDismiss?"true":"false"),1)]),i("button",{class:"btn btn-sm btn-outline-info ms-3 w-25",onClick:t[29]||(t[29]=s=>e.updatePermanentlyDismiss(s))}," Toggle ")])])]),_:1},8,["loaded"])}const bt=v(C,[["render",ct]]);export{bt as F};
