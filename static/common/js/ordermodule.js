/**
 * Created by Msater Zg on 2017/8/11.
 */
// 订单推送系统

define(function (require, exports, module) {
	// 通过 require 引入依赖
	/* require('http://localhost:63343/service-html/spm_modules/layer/layer.js');*/
	//地址，参数（为对象），方法请求成功
	const api = require('./api')
	let orderModule = (function () {

		let getUserMark = (loginName, contextFlag, type, success) => {
			api.system.userManage.getSysUser(loginName, (rep) => {
				insertManPowerData(rep.user_mark, loginName, contextFlag, type, success)
			})
		}

		let insertManPowerData = (userMark, loginName, contextFlag, type, success) => {
			let orderUrl = $('.form-control.al-order-url').val()
			let orderContext = $('.form-control.al-order-context').val()
			let orderSupplement = $('.form-control.al-order-supplement').val()
			let realMark = parseInt($('.al-order-total-number').text(), 10)
			let markName = []
			let markOrderNumber = []
			let markNumber = []
			$('.custom-mark-content .form-group').each(function () {
				markName.push($(this).find('.al-order-number').attr('data-name'))
				markOrderNumber.push($(this).find('.al-order-number').val())
				markNumber.push($(this).find('.al-single-number').attr('data-mark'))
			})
			let executionMode = $('.mode-execution:checked').val()
			let orderData = {
				task_url: orderUrl,
				task_start_mark: realMark,
				task_name: markName.join(','),
				task_number: markOrderNumber.join(','),
				task_mark: markNumber.join(','),
				task_execution: executionMode,
				task_type: type,
				task_create: loginName,
				task_supplement: orderSupplement,
			}
			if (executionMode === '0') {
				// 手动执行
				orderData.task_execution_context = $('.form-control.execution-content').val()
			}
			if (contextFlag) {
				orderData.task_context = orderContext
			}

			if (contextFlag) {
				orderData.task_context = orderContext
			}

			if (orderData.task_url === '' || orderData.task_start_mark === 0 || (contextFlag && orderContext === '')) {
				if (orderData.task_url === '') {
					$('.form-control.al-order-url').addClass('active')
				}
				if (orderData.task_context === '') {
					$('.form-control.al-order-context').addClass('active')
				}
				if (orderData.task_start_mark === 0) {
					$('.form-control.al-order-number').addClass('active')
				}
				layer.msg('信息填写不完整!', {
					time: 1500
				})
			} else {
				if (userMark - realMark > 0) {
					api.manpower.manpowerManage.insertManPower(JSON.stringify(orderData), (rep) => {
						let realMarkS = $('#user-real-mark', window.parent.document).text()
						realMarkS = parseInt(realMarkS) - parseInt(realMark)
						$('#user-real-mark', window.parent.document).text(realMarkS)
						if (rep.result === 1) {
							success(1)
							layer.msg('下单成功!', {icon: 1, time: 1000})
						} else {
							layer.msg('下单失败!', {icon: 2, time: 1000})
						}
					})
				} else {
					success(0)
				}
			}
		}

		return {
			writeOrderDom: function (htmlId, orderData, success) {
				let orderData_ = {
					contentFlag: true, // 判断是否需要内容
					className: 'button-faker',
					titleContent: '',
					exampleContent: '',
					userLoginName: 'admin',
					dataType: '1',
				}
				console.log(success)
				let newOrderData = Object.assign(orderData_, orderData)
				let orderDom = []
				api.button.buttonManage.getButtonByName(newOrderData.className, (rep) => {
					console.log(rep);
					let buttonData = rep.data
					orderDom.push('<div id="add-single-order-dialog" class="al-ui-dialog">')
					orderDom.push('<div class="dialog-context">')
					orderDom.push('<div class="function-hint">')
					orderDom.push('<div class="title">产品信息</div>')
					orderDom.push('<p class="content">')
					orderDom.push('' + buttonData.good_explain + ' </p>')
					orderDom.push('</div>')
					orderDom.push('<form class="form-horizontal">')
					orderDom.push('<div class="form-group">')
					orderDom.push('<label class="col-sm-2 control-label"><span class="must-write-icon">*</span>' + newOrderData.titleContent + '</label>')
					orderDom.push('<div class="col-sm-5">')
					orderDom.push('<input type="text" class="form-control al-order-url" placeholder="' + newOrderData.titleContent + '">')
					orderDom.push('</div>')
					orderDom.push('</div>')
					orderDom.push('<div class="form-group">')
					orderDom.push('<label class="col-sm-2 control-label"></label>')
					orderDom.push('<div class="col-sm-10">')
					orderDom.push('<div class="al-order example-word">' + newOrderData.exampleContent + '</div>')
					orderDom.push('</div>')
					orderDom.push('</div>')
					orderDom.push('<div class="custom-mark-content"> ')
					let markNames = buttonData.mark_names.split(',')
					let markNamesLen = markNames.length
					let markNumbers = buttonData.mark_numbers.split(',')
					let markLimits = buttonData.mark_limits.split(',')
					let markTotal = 0
					for (let i = 0; i < markNamesLen; i++) {
						orderDom.push('<div class="form-group"> ')
						orderDom.push('<label class="col-sm-2 control-label"><span class="must-write-icon">*</span>' + markNames[i] + ':</label> ')
						orderDom.push('<div class="col-sm-2"> ')
						orderDom.push('<input type="number" min="100" class="form-control al-order-number" value="0" data-name="' + markNames[i] + '" placeholder="数量"> ')
						orderDom.push('</div> ')
						orderDom.push('<div class="col-sm-3"> ')
						orderDom.push('<label class="col-sm-8 control-label">单个分值:</label> ')
						orderDom.push('<span style="color: red;" class="col-sm-4 al-single-number" data-mark="' + markNumbers[i] + '">' + markNumbers[i] + '分</span> ')
						orderDom.push('</div> ')
						orderDom.push('<div class="col-sm-3"> ')
						orderDom.push('<label class="col-sm-8 control-label"> 最少数量:</label> ')
						orderDom.push('<span style="color: red;" class="col-sm-4 al-limit-number" data-number="' + markLimits[i] + '">' + markLimits[i] + '</span> ')
						orderDom.push('</div> ')
						orderDom.push('</div> ')
					}
					orderDom.push('</div> ')
					orderDom.push('<div class="form-group">')
					orderDom.push('<label class="col-sm-2 control-label">本次合计:</label>')
					orderDom.push('<span style="color: red;" class="col-sm-10 al-order-total-number">0分</span>')
					orderDom.push('</div>')
					orderDom.push('<div class="form-group">')
					orderDom.push('<label class="col-sm-2 control-label">执行方式:</label>')
					orderDom.push('<div class="col-sm-5">')
					orderDom.push('<label class="radio-inline">')
					orderDom.push('<input type="radio" class="mode-execution" name="mode-execution" value="1" checked="true">')
					orderDom.push('自动执行')
					orderDom.push('</label>')
					orderDom.push('<label class="radio-inline">')
					orderDom.push('<input type="radio" class="mode-execution" name="mode-execution" value="0"> 计划任务')
					orderDom.push('</label>')
					orderDom.push('<div class="order-plan" style="display: none;">')
					orderDom.push('<textarea class="form-control execution-content" placeholder="计划任务情况说明" rows="3"></textarea>')
					orderDom.push('</div>')
					orderDom.push('</div>')
					orderDom.push('</div>')
					if (newOrderData.contentFlag) {
						orderDom.push('<div class="form-group">')
						orderDom.push('<label class="col-sm-2 control-label"><span class="must-write-icon">*</span>执行内容:</label>')
						orderDom.push('<div class="col-sm-5">')
						orderDom.push('<label class="radio-inline">')
						orderDom.push('<input type="radio" name="inlineRadioOptions" value="1" checked="true"> 指定内容')
						orderDom.push('</label>')
						orderDom.push('<textarea class="form-control al-order-context" rows="3" placeholder="一行代表一条评论"></textarea>')
						orderDom.push('</div>')
						orderDom.push('</div>')
					}
					orderDom.push('<div class="form-group">')
					orderDom.push('<label class="col-sm-2 control-label">补充说明:</label>')
					orderDom.push('<div class="col-sm-5">')
					orderDom.push('<textarea class="form-control al-order-supplement" placeholder="补充说明!" rows="3"></textarea>')
					orderDom.push('</div>')
					orderDom.push('<div class="col-sm-3">')
					orderDom.push('<p>' + buttonData.supplement_explain + '</p>')
					orderDom.push('</div>')
					orderDom.push('</div>')
					orderDom.push('</form>')
					orderDom.push('<div></div>')
					orderDom.push('</div>')
					orderDom.push('<div class="order-absolute-dialog-action">')
					orderDom.push('<button type="button" class="btn btn-primary order-sure-button">提交</button>')
					orderDom.push('</div>')
					orderDom.push('</div>')

					$(htmlId).empty()
					$(htmlId).append(orderDom.join(''))

					$('.form-control.al-order-number').change(function () {
						// 输入框移除事件
						markTotal = 0
						$('.custom-mark-content .form-group').each(function () {
							$('.form-control.al-order-number').removeClass('active')
							let number = parseInt($(this).find('.al-order-number').val(), 10)
							let numberLimit = parseInt($(this).find('.al-limit-number').attr('data-number'), 10)
							if (number < numberLimit) {
								number = numberLimit
								$(this).find('.al-order-number').val(numberLimit)
							}
							let singleMark = parseInt($(this).find('.al-single-number').attr('data-mark'), 10)
							markTotal += parseInt(number * singleMark, 10)
						})
						$('.al-order-total-number').text(markTotal)
					})

					$('.form-control.al-order-url').change(() => {
						if ($('.form-control.al-order-url').val() === '') {
							$('.form-control.al-order-url').addClass('active')
						} else {
							$('.form-control.al-order-url').removeClass('active')
						}
					})

					$('.form-control.al-order-context').change(() => {
						if ($('.form-control.al-order-context').val() === '') {
							$('.form-control.al-order-context').addClass('active')
						} else {
							$('.form-control.al-order-context').removeClass('active')
						}
					})

					$('.mode-execution').click(() => {
						if ($('.mode-execution:checked').val() === '1') {
							$('.order-plan').stop().slideUp()
						} else {
							$('.order-plan').stop().slideDown()
						}
					})
					$('.btn-primary.order-sure-button').click(() => {
						getUserMark(newOrderData.userLoginName, true, newOrderData.dataType, success)
					})
				})
			},
		}
	}())
	return {
		orderModule: orderModule
	}
})