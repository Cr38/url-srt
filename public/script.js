$(document).ready(function() {
    $('#url').bind("enterKey",function(e){
        
        const url = $(this).val();
        const slug = undefined;

        fetch('/url', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                url: url,
                slug: slug || undefined,
            }),
        }).then(response => response.text())
        .then(data => {
            console.log(data);
            $("#result").text(data);
            return data;
        });
     });

     $('#url').keyup(function(e){
         if(e.keyCode == 13)
         {
             $(this).trigger("enterKey");
         }
     });
})
