(function (define) {
    define(["jquery", "api", "translate", "utils", "QRCode"], function ($, api, translate, utils, QRCode) {
        //register events
        var activeGatewayId = 0;    // FirePayGateAgentId of the active gateway tab
        var activeGatewayCode = '';  // PayGateCode of the active gateway tab
        var gatewayQrActive = false; // true after createtran succeeds and QR is shown

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


            // Gateway submit
            $('#btnGatewaySubmit').click(submitGatewayDeposit);
        }

        function ShowAjaxError(errText) {
            $('#errorBox').html(errText).css('display', 'block');
        }

        function renderQuickAmounts(rowId, inputId, minLimit) {
            var base = [10000, 20000, 50000, 100000, 200000, 500000, 1000000];
            // Extend list until at least 4 candidates >= minLimit, capped at 20000000
            while (base.filter(function (v) { return v >= minLimit; }).length < 4
                && base[base.length - 1] < 20000000) {
                base.push(base[base.length - 1] + 1000000);
            }
            var buttons = base.filter(function (v) { return v >= minLimit; }).slice(0, 4);

            var $td = $('#' + rowId + ' td:last').empty().off('click');
            if (buttons.length === 0) {
                $('#' + rowId).hide();
                return;
            }
            $('#' + rowId).show();
            $.each(buttons, function (_, val) {
                $td.append('<div class="quick-amt-btn" data-val="' + val + '">' + (val / 1000) + 'k</div>');
            });
            $td.on('click', '.quick-amt-btn', function () {
                $('#' + inputId).val(parseInt($(this).data('val')));
            });
        }

        function tabClickHandler() {
            if (gatewayQrActive) {
                getDeposit();
                return;
            }

            var $btn = $(this);
            $('.deposit-tab-btn').removeClass('active');
            $btn.addClass('active');

            if ($btn.attr('id') === 'btnTabBank') {
                // Bank tab
                $('#tblDepositInner').show();
                $('#tblDepositBoard').show();
                $('#tblGatewayInner').hide();
                $('#divGatewayBoard').hide();
            } else {
                // Gateway tab
                activeGatewayId = parseInt($btn.data('gw-id'));
                activeGatewayCode = $btn.data('gw-code') || '';
                var minLimit = parseInt($btn.data('min')) || 0;
                var maxLimit = parseInt($btn.data('max')) || 0;
                $('#tblGatewayInner').show();
                $('#divGatewayBoard').show();
                $('#tblDepositInner').hide();
                $('#tblDepositBoard').hide();
                renderQuickAmounts('rowGatewayQuickAmounts', 'txtGatewayAmount', minLimit);
                $('#lblGatewayMin').text('Min ' + utils.AddCommas(minLimit));
                $('#lblGatewayMax').text('Max ' + utils.AddCommas(maxLimit));
                $('#rowGatewayMinMax').show();
                // Reset QR state
                gatewayQrActive = false;
                $('#rowGatewayQr').hide();
                $('#rowGatewayCheck').hide();
                $('#rowGatewaySubmit').show();
                $('#txtGatewayAmount').val('');
            }
        }

        function buildDepositTabs(bankListTo, gatewayList) {
            // Clear and re-build tab row (safe for repeated getDeposit calls)
            $('#rowDepositTabs').empty().off('click');

            // Bank tab — always first
            $('#rowDepositTabs').append('<div class="deposit-tab-btn active" id="btnTabBank">Bank</div>');

            // One tab per gateway
            if (gatewayList) {
                for (var g = 0; g < gatewayList.length; g++) {
                    $('#rowDepositTabs').append(
                        '<div class="deposit-tab-btn"' +
                        ' data-gw-id="' + gatewayList[g].FirePayGateAgentId + '"' +
                        ' data-gw-code="' + gatewayList[g].PayGateCode + '"' +
                        ' data-min="' + gatewayList[g].MinLimit + '"' +
                        ' data-max="' + gatewayList[g].MaxLimit + '">' +
                        gatewayList[g].Name + '</div>'
                    );
                }
            }

            // Delegated click handler
            $('#rowDepositTabs').on('click', '.deposit-tab-btn', tabClickHandler);

            // Show tab row
            $('#rowDepositTabs').show();

            // Bank-first default state
            $('#tblDepositInner').show();
            $('#tblDepositBoard').show();
            $('#tblGatewayInner').hide();
            $('#divGatewayBoard').hide();
            $('#rowGatewayMinMax').hide();
        }

        function submitGatewayDeposit() {
            var data = {
                gatewayAgentId: activeGatewayId,
                gatewayCode: activeGatewayCode,
                amount: parseInt($('#txtGatewayAmount').val())
            };
            api.POST('/api/setGatewayDeposit', JSON.stringify(data), onSetGatewaySuccess, onSetGatewayFail);
        }

        function onSetGatewaySuccess(result, errCode, errText) {
            var payload = $.parseJSON(result);
            var url = payload.endpoint + '/createtran';
            $.ajax({
                type: 'POST',
                url: url,
                data: payload.encBody,
                contentType: 'text/plain',
                dataType: 'json',
                headers: { 'X-Timestamp': payload.timestamp.toString() },
                success: function (gwResponse) {
                    if (gwResponse.ErrCode !== 0) {
                        alert(gwResponse.ErrMsg || 'Gateway error');
                        ShowAjaxError(gwResponse.ErrMsg || 'Gateway error');
                        return;
                    }
                    var qrId = activeGatewayCode + '-' + gwResponse.Result.QrID;
                    var qrContent = gwResponse.Result.QrContent;
                    // Render QR
                    document.getElementById("gatewayQrCode").innerHTML = "";
                    new utils.QRCode(document.getElementById("gatewayQrCode"), {
                        text: qrContent, width: 168, height: 168, quietZone: 5
                    });
                    gatewayQrActive = true;
                    $('#rowGatewayQr').show();
                    $('#rowGatewaySubmit').hide();
                    $('#rowGatewayCheck').show();
                    $('#btnGatewayCheck').off('click').on('click', function () {
                        checkGatewayStatus(qrId, 1, activeGatewayId);
                    });
                },
                error: function () {
                    alert('Failed to connect to payment gateway. Please try again.');
                    ShowAjaxError('Failed to connect to payment gateway. Please try again.');
                }
            });
        }

        function onSetGatewayFail(errCode, errText) {
            alert(errText || 'Request failed');
            ShowAjaxError(errText || 'Request failed');
        }

        function checkGatewayStatus(qrId, mode, gatewayAgentId) {
            var data = { qrId: qrId, gatewayAgentId: gatewayAgentId };
            api.POST('/api/getGatewayCheckPayload', JSON.stringify(data), function (result) {
                var payload = $.parseJSON(result);
                var url = payload.endpoint + '/checktran';
                $.ajax({
                    type: 'POST',
                    url: url,
                    data: payload.encBody,
                    contentType: 'text/plain',
                    dataType: 'json',
                    headers: { 'X-Timestamp': payload.timestamp.toString() },
                    success: function (gwResponse) {
                        if (gwResponse.ErrCode !== 0) {
                            alert(gwResponse.ErrMsg || 'Gateway error');
                            ShowAjaxError(gwResponse.ErrMsg || 'Gateway error');
                            return;
                        }
                        var status = gwResponse.Result.Status;
                        if (mode == 0 && status > 0) {
                            gatewayQrActive = false;
                            $('.tdDepositCheck').hide();
                            if (status == 1) {
                                $('#txtDepositStatus').html("Success");
                            } else if (status == 2) {
                                $('#txtDepositStatus').html("Failed");
                            }
                            var data = new Object();
                            data.force = 1;
                            var json = JSON.stringify(data);
                            api.POST('/api/totalCredit', json, function (result, errCode, errText) {
                                var json = $.parseJSON(result);
                                $('#txtCurrency').html(json.curcode);
                                $('#txtCredit').html(json.totalCredit);
                                $('.playProfileBalance').html(json.curcode + " " + json.totalCredit + " ");
                            }, function (errCode, errText) {
                                return;
                            });
                            return;
                        }

                        if (status === 1) {
                            alert('Payment successful!');
                            gatewayQrActive = false;
                            $('#btnGatewayCheck').data('qrId', null);
                            $('#btnDepositCheck').hide();
                            $('.tdDepositCheck').hide();
                            //document.getElementById('btnRefreshCredit').click();
                            // update balance
                            var data = new Object();
                            data.force = 1;
                            var json = JSON.stringify(data);
                            api.POST('/api/totalCredit', json, function (result, errCode, errText) {
                                var json = $.parseJSON(result);
                                $('#txtCurrency').html(json.curcode);
                                $('#txtCredit').html(json.totalCredit);
                                $('.playProfileBalance').html(json.curcode + " " + json.totalCredit + " ");
                            }, function (errCode, errText) {
                                return;
                            });
                            document.getElementById('menuHome').click();
                            //getDeposit();
                        } else if (status === 2) {
                            alert('Payment failed.');
                            gatewayQrActive = false;
                            $('#btnGatewayCheck').data('qrId', null);
                            $('#btnDepositCheck').hide();
                            $('.tdDepositCheck').hide();
                            // getDeposit();
                            gatewayQrActive = false;
                            $('#rowGatewayQr').hide();
                            $('#rowGatewaySubmit').show();
                            $('#rowGatewayCheck').hide();
                            $('#txtGatewayAmount').val('');
                        } else {
                            alert('Payment is still pending. Please try again shortly.');
                            ShowAjaxError('Payment is still pending. Please try again shortly.');
                        }
                    },
                    error: function () {
                        alert('Failed to connect to payment gateway. Please try again.');
                        ShowAjaxError('Failed to connect to payment gateway. Please try again.');
                    }
                });
            }, function (errCode, errText) {
                alert(errText || 'Request failed');
                ShowAjaxError(errText || 'Request failed');
            });
        }

        //GET DEPOSIT
        function getDeposit() {
            api.POST('/api/getDeposit', "", getDepositSuccess, getDepositFail);
        }
        function getDepositSuccess(result, errCode, errText) {
            var json = $.parseJSON(result);
            //var qrOptions = {
            //    text: "https://ytl.pkvn.mobi",
            //    };
            //new QrCode(document.getElementById("bnkQrCode"), qrOptions);
            if (!json.PendingRequest.IsPending) {
                gatewayQrActive = false;
                $('#depositTitle').css('display', 'table-cell');
                $('#questionTitle').css('display', 'none');
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
                        $('#lstDepositToBankName').off('change').on('change', function () {

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
                buildDepositTabs(json.BankListTo, json.GatewayList);

            } else {
                $('#depositTitle').css('display', 'table-cell');
                $('#questionTitle').css('display', 'none');
                $('#tblDepositInner').css('display', 'none');
                $('#tblGatewayInner').css('display', 'none');
                $('#tblDepositBoard').css('display', 'none');
                $('#divGatewayBoard').hide();
                $('#tblDespositPending').css('display', 'table');
                $('#txtDepositFromBank').html('<div>' + json.PendingRequest.FromBankName + '</div><div>' + json.PendingRequest.FromAccountName + '</div><div>' + json.PendingRequest.FromBankAccount + '</div>');
                if (json.PendingRequest.PaymentMethod == "Payment Gateway") {
                    //$('#txtDepositToBank').html(json.PendingRequest.GatewayName);
                    $('#txtDepositToBank').html('<div style="float:left">' + json.PendingRequest.GatewayName + '</div><div style="float:left;margin-left:5px">' + json.PendingRequest.ToBankAccount + '</div>');
                } else {
                    $('#txtDepositToBank').html('<div">' + json.PendingRequest.ToBankName + '</div><div>' + json.PendingRequest.ToAccountName + '</div><div>' + json.PendingRequest.ToBankAccount + '</div>');
                }
                $('#txtDepositPendingAmount').html(json.PendingRequest.Amount);
                $('#txtDepositTransferDate').html(json.PendingRequest.TransDate.split(' ')[0]);
                $('#txtDepositPaymentMethod').html(json.PendingRequest.PaymentMethod);
                $('#txtDepositPendingRemark').html(json.PendingRequest.Remark);
                $('#txtDepositStatus').html(json.PendingRequest.Status);

                // Show Check Status button only for gateway deposits
                if (json.PendingRequest.QrId && json.PendingRequest.QrId.length > 0) {
                    $('#btnDepositCheck').show();
                    $('#btnDepositCheck').off('click').on('click', function () {
                        checkGatewayStatus(json.PendingRequest.QrId, 0, json.PendingRequest.FirePayGateAgentId);
                    });
                } else {
                    $('#btnDepositCheck').hide();
                    $('.tdDepositCheck').hide();
                }

                // Hide tab buttons on pending page
                $('#rowDepositTabs').hide();
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