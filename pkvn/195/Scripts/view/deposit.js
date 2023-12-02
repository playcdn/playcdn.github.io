(function (define) {
    define(["jquery", "api", "translate", "utils", "QRCode"], function ($, api, translate, utils, QRCode) {
        //register events
        return function () {
            getDeposit();
            $('#btnDepositSubmit').click(setDeposit);
            $('#lstDepositFromBankName').change(function () {
                var fromVal = $(this).val();
                $("#lstDepositToBankName > option").each(function () {
                    if ($(this).val() == fromVal) {
                        $('#lstDepositToBankName').val($(this).val()).trigger('change');
                    }
                });
            })
            $('#btnDepositLiveChat').click(function () {
                utils.PopUpPingBox('/app/livechat.html');
            })
            $('#btnDepositLiveChat > div').css('background', 'url("/core/Images/icons/chat_' + fontColor + '.png") no-repeat 0 4px');
        }

        //GET DEPOSIT
        function getDeposit() {
            api.POST('/api/getDeposit', "", getDepositSuccess, getDepositFail);
        }
        function getDepositSuccess(result, errCode, errText) {
            var json = $.parseJSON(result);
            // console.log(json);
            //var qrOptions = {
            //    text: "https://ytl.pkvn.mobi",
            //    };
            //new QrCode(document.getElementById("bnkQrCode"), qrOptions);
            if (json.PendingRequest.FromBankName == "") {
                $('#depositTitle').css('display', 'table-cell');
                $('#questionTitle').css('display', 'none');
                $('#tblDepositInner').css('display', 'table');
                $('#tblDepositBoard').css('display', 'table');
                $('#tblDespositPending').css('display', 'none');

                //bank from
                //if ($.trim(json.BankInfoFrom.BankName.length) > 0)
                //    json.BankListFrom.push(json.BankInfoFrom.BankName);
                if (json.BankListFrom.length > 0) {
                    $('#lstDepositFromBankName').find('option').remove();
                    for (i = 0; i < json.BankListFrom.length; i++) {
                        if (json.BankListFrom[i] == json.BankInfoFrom.BankName) {
                            $('#lstDepositFromBankName').append('<option value="' + json.BankListFrom[i] + '" selected="selected">' + json.BankListFrom[i] + '</option>').attr('disabled', 'disabled');
                            $('#txtDepositFromAccountName').val(json.BankInfoFrom.AccName).attr('disabled', 'disabled');
                            $('#txtDepositFromAccountNumber').val(json.BankInfoFrom.AccNo).attr('disabled', 'disabled');
                        }
                        else {
                            $('#lstDepositFromBankName').append('<option value="' + json.BankListFrom[i] + '">' + json.BankListFrom[i] + '</option>');
                        }
                    }
                }
                if (json.BankListTo.length > 0) {
                    //bank to
                    if (json.BankListTo.length > 0) {
                        $('#lstDepositToBankName').find('option').remove();
                        var selectedIndex = 0;

                        var matched = false;
                        for (i = 0; i < json.BankListTo.length; i++) {
                            var selected = "";
                            if (json.BankListTo[i].BankName == json.BankInfoFrom.BankName) {
                                selectedIndex = i;
                                var selected = "selected";
                                new translate().warning('Min|' + utils.AddCommas(json.BankListTo[i].MinDpLimit), '', null, ShowMinDepo);
                            }
                            $('#lstDepositToBankName').append('<option value="' + json.BankListTo[i].BankName + '" bankId="' + json.BankListTo[i].AgBankId + '" ' + selected + '>' + json.BankListTo[i].BankName + '</option>');

                            if ($('#lstDepositFromBankName').attr('disabled') != 'disabled' && selected.length == 0 && matched == false) {
                                $("#lstDepositFromBankName > option").each(function () {
                                    $from = $(this);
                                    if ($from.text() == json.BankListTo[i].BankName) {
                                        $('#lstDepositFromBankName').val(json.BankListTo[i].BankName);
                                        matched = true;
                                        return false;
                                    }
                                });
                            }
                        }
                        $('#txtDepositToAccountName').val(json.BankListTo[selectedIndex].AccName);
                        $('#txtDepositToAccountNumber').val(json.BankListTo[selectedIndex].AccNo);
                        $('#lstDepositToBankName').change(function () {

                            for (i = 0; i < json.BankListTo.length; i++) {
                                if ($(this).find(':selected').attr('bankId') == json.BankListTo[i].AgBankId) {
                                    $('#txtDepositToAccountName').val(json.BankListTo[i].AccName);
                                    $('#txtDepositToAccountNumber').val(json.BankListTo[i].AccNo);
                                    if (json.BankListTo[i].QrCode.length > 0) {
                                        $('#rowQrCode').show();
                                        setQrCode(json.BankListTo[i].QrCode);
                                    }
                                    else {
                                        clearQrCode(json.BankListTo[i].QrCode);
                                        $('#rowQrCode').hide();

                                    }
                                    new translate().warning('Min|' + utils.AddCommas(json.BankListTo[i].MinDpLimit), '', null, ShowMinDepo);
                                }
                            }
                        });
                    }
                } else {
                    //disable deposit
                    $('#tblLiveChat').css('display', 'table');
                    $('#txtDepositAmount').attr('disabled', 'disabled');
                    $('#lstDepositFromBankName').attr('disabled', 'disabled');
                    $('#txtDepositFromAccountName').attr('disabled', 'disabled');
                    $('#txtDepositFromAccountNumber').attr('disabled', 'disabled');
                    $('#lstDepositToBankName').attr('disabled', 'disabled');
                    $('#txtDepositToAccountName').attr('disabled', 'disabled');
                    $('#txtDepositToAccountNumber').attr('disabled', 'disabled');
                    $('#txtDepositRemark').attr('disabled', 'disabled');
                    $('#btnDepositSubmit').removeClass("themeBtn").addClass("themeBtnDisabled").unbind("click");
                }
            } else {
                $('#depositTitle').css('display', 'table-cell');
                $('#questionTitle').css('display', 'none');
                $('#tblDepositInner').css('display', 'none');
                $('#tblDepositBoard').css('display', 'none');
                $('#tblDespositPending').css('display', 'table');
                $('#txtDepositFromBank').html('<div>' + json.PendingRequest.FromBankName + '</div><div>' + json.PendingRequest.FromAccountName + '</div><div>' + json.PendingRequest.FromBankAccount + '</div>');
                $('#txtDepositToBank').html('<div>' + json.PendingRequest.ToBankName + '</div><div>' + json.PendingRequest.ToAccountName + '</div><div>' + json.PendingRequest.ToBankAccount + '</div>');
                $('#txtDepositPendingAmount').html(json.PendingRequest.Amount);
                $('#txtDepositTransferDate').html(json.PendingRequest.TransDate.split(' ')[0]);
                $('#txtDepositPaymentMethod').html(json.PendingRequest.PaymentMethod);
                $('#txtDepositPendingRemark').html(json.PendingRequest.Remark);
                $('#txtDepositStatus').html(json.PendingRequest.Status);
            }
            translate();
        }
        function getDepositFail(errCode, errText) {
            console.log(errCode + ":" + errText);
        }

        function ShowMinDepo(code, msg) {
            $('#lblDepositMinDepo').html("(" + msg + ")");
        }

        //SET DEPOSIT
        function setDeposit() {
            var data = new Object();
            data.amt = $('#txtDepositAmount').val();
            data.fromBankName = $('#lstDepositFromBankName').val();
            data.fromAccName = $('#txtDepositFromAccountName').val();
            data.fromBankAcc = $('#txtDepositFromAccountNumber').val();
            data.toBankId = $('#lstDepositToBankName option:selected').attr('bankId');
            //data.toBankName = $('#lstDepositToBankName').val();
            //data.toAccName = $('#txtDepositToAccountName').val();
            //data.toBankAcc = $('#txtDepositToAccountNumber').val();
            data.remark = $('#txtDepositRemark').val();
            var json = JSON.stringify(data);
            api.POST('/api/setDeposit', json, setDepositSuccess, setDepositFail);
        }
        function setDepositSuccess(result, errCode, errText) {
            if (result == "1") getDeposit();
        }
        function setDepositFail(errCode, errText) {
            console.log(errCode + ":" + errText);
        }
        function setQrCode(qrCodeData) {
            document.getElementById("bnkQrCode").innerHTML = ""
            var options = {
                text: qrCodeData,
                width: 168,
                height: 168,
                quietZone: 5
            };
            new utils.QRCode(document.getElementById("bnkQrCode"), options);
        }
        function clearQrCode() {
            document.getElementById("bnkQrCode").innerHTML = ""
        }


    })
}(myGlobalRequire.define));