<template>
<div id="createParty" class="modal fade" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content custom-bg-dark">
            <div class="modal-header text-dark bg-done">
                <h5 class="modal-title" >Create party</h5>
                <button type="button" class="close" data-dismiss="modal">
                <span>&times;</span>
                </button>
            </div>
            <div class="modal-body" style="overflow: hidden">
                <img src="../images/the_A.png" class="the-a-background">
                <div class="container">
                    <div class="form-group row">
                        <label class="col-sm-4" for="partyName"> Party name:</label><input class="col-sm-8 form-control" style="border-radius: 100px 100px 100px 100px" type="text" id="partyName" @keyup.enter="createParty">
                    </div>
                    <p class="mt-4 text-shadow">{{ info }}</p>
                    <hr>
                    <button type="button" class="btn btn-mg float-right" @click="createParty">Save</button>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
export default {

}
</script>

<style>

</style>
