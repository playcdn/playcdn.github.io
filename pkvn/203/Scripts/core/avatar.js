(function (define) {
    define(["jquery", "api"], function ($, api) {
        var total = 700;
        var perPage = 42;
        var errMsg = "Change avatar failed";
        var page = 1;
        var totalPage = Math.ceil(total / perPage);

        $(document).ready(function () {
            $('#btnPrev').prop("disabled", true);
            $('#btnNext').prop("disabled", false);
            createGrid();
            createPage();      
            $('#ddlPage').change(function () {
                page = parseInt($(this).val());
                createGrid();
            });

            $('#btnPrev').click(function () {
                page = page - 1 < 1 ? 1 : page - 1;
                createGrid();
            });

            $('#btnNext').click(function () {
                page = page + 1 > totalPage ? totalPage : page + 1;
                createGrid();
            });
        });

        function initImgClick() {
            $(".img-avatar").unbind("click");
            $('.img-avatar').click(function () {

                var data = new Object();
                data.avatar_id = $(this).attr('data-id');
                var json = JSON.stringify(data);
                api.POST('/api/setAvatar', json, setAvatarSuccess, setAvatarFailed);
            });
        }

        function setAvatarSuccess(result, errCode, errText) {
            closedWindow();
        }

        function setAvatarFailed(errCode, errText) {

        }

        function createPage() {
             var option = "";
            for (var i = 1; i <= totalPage; i++) {
                var single = '<option value="' + i + '">Page ' + i + '</option>';
                option += single;
            }
            $('#ddlPage').html(option);
        }

        function createGrid() {
            var images = "";
            var start = (page - 1) * perPage + 1;
            var end = start + perPage - 1 > total ? total : start + perPage - 1;
            for (var i = start; i <= end; i++) {
                var num = total + 1 - i;
                var single = '<div class="img-avatar" data-id="' + num + '"><img src="/core/Images/avatar/' + num + '.jpg?v=1"></div>';
                images += single;
            }
            $('#grid').html(images);
            onPageChange();
            initImgClick();
        }

        function closedWindow() {
            try {
                window.opener.refreshAvatar();
            }
            catch (err) {
            }
            window.close();
            return false;
        }
        function onPageChange() {
            $('#btnPrev').prop("disabled", false);
            $('#btnNext').prop("disabled", false);
            if (page == 1)
                $('#btnPrev').prop("disabled", true);
            else if (page == totalPage)
                $('#btnNext').prop("disabled", true);
            $('#ddlPage').val(page);
        }
    })
}(myGlobalRequire.define));