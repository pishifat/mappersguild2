$(function () {
    $('#apply').click(async function () {
        $('#apply').attr('disabled', true);
        $('#confirm').text('');
        $('#errors').text('');
        const mode = $('input[name=mode]:checked').val();
        let mods = [];
        let regexp = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
        for (let i = 0; i < 4; i++) {
            let mod = $(`#mod${i}`).val()
            if(mod.indexOf('https://osu.ppy.sh/beatmapsets/') == 0 && regexp.test(mod)){
                mods.push(mod);
            }
        }
        if(!mode){
            $('#errors').text('You must select a gamemode!');
        }else if(mods.length < 2){
            $('#confirm').text('');
            $('#errors').text('You must enter at least two mods!');
        }else{
            await axios.post(`/qat/apply`, {mode: mode, mods: mods}).then(response => {//temporary while test doesnt exist
                if(response.data.error){
                    $('#errors').text(response.data.error);
                }else{
                    $('#confirm').text('Your application has been submitted! Evaluation will take approximately one week.');
                }
                
            });
        }
        $('#apply').attr('disabled', false);
    });
});
