; (function () {
  'use strict'

  angular
    .module('koala.core')
    .constant('APP_REQUIRES', getAppRequires())
    .constant('APP_DATA_MAP', getAppDataMap())
    .constant('APP_CONS', getAppCons())
    .constant('LOCATION', getLocation())

  function getAppRequires() {
    return {
      files: [
        { name: 'global', view: 'app/layout/container_nosb.html' },
        { name: 'global.search', view: 'app/global/views/search.html' },
        { name: 'global.changelog', view: 'app/global/views/changelog.html' },
        { name: 'global.settings', view: 'app/global/views/settings.html' },
        { name: 'clients', view: 'app/layout/container.html' },
        { name: 'clients.personal', view: 'app/clients/personal/personal-list.html' },
        { name: 'clients.personal.detail', view: 'app/clients/personal/personal-detail.html' },
        { name: 'clients.personal.detail.info', view: 'app/clients/personal/personal-info.html' },
        { name: 'clients.personal.detail.info', view: 'app/clients/personal/personal-info.html' },
        { name: 'clients.personal.detail.contact', view: 'app/clients/personal/personal-contact.html' },
        { name: 'clients.personal.detail.recharge', view: 'app/clients/personal/personal-recharge.html' },
        { name: 'clients.personal.detail.usage', view: 'app/clients/personal/personal-usage.html' },
        { name: 'clients.personal.detail.log', view: 'app/clients/personal/personal-log.html' },
        { name: 'clients.potential', view: 'app/clients/views/potential.html' },
        { name: 'clients.potential_detail', view: 'app/clients/views/detail.html' },
        { name: 'clients.registed', view: 'app/clients/views/registed.html' },
        { name: 'clients.registed_detail', view: 'app/clients/views/detail.html' },
        { name: 'clients.public', view: 'app/clients/views/public.html' },
        { name: 'clients.public_pot_detail', view: 'app/clients/views/detail.html' },
        { name: 'clients.public_reg_detail', view: 'app/clients/views/detail.html' },
        { name: 'clients.conflict', view: 'app/clients/views/conflict.html' },
        { name: 'clients.conflict_detail', view: 'app/clients/views/conflict_detail.html' },
        { name: 'clients.discarded', view: 'app/clients/views/discarded.html' },
        { name: 'clients.identity', view: 'app/clients/identity/identity-list.html' },
        { name: 'contact', view: 'app/layout/container.html' },
        { name: 'contact.records', view: 'app/contact/records/records-list.html' },
        { name: 'contact.records.new', view: 'app/contact/records/records-new.html' },
        { name: 'contact.manage', view: 'app/contact/manage/manage-list.html' },
        { name: 'contact.manage.new', view: 'app/contact/manage/manage-new.html' },
        { name: 'business', view: 'app/layout/container.html' },
        { name: 'business.usage', view: 'app/business/usage/usage-list.html' },
        { name: 'business.usage.detail', view: 'app/business/usage/usage-detail.html' },
        { name: 'business.orders', view: 'app/business/orders/orders-list.html' },
        { name: 'business.invoices', view: 'app/business/invoices/invoices-list.html' },
        { name: 'business.invoices.new', view: 'app/business/invoices/invoices-new.html' },
        { name: 'business.invoices.detail', view: 'app/business/invoices/invoices-detail.html' },
        { name: 'business.charges', view: 'app/business/charges/charges-list.html' },
        { name: 'business.charges.standard', view: 'app/business/charges/charges-standard.html' },
        { name: 'business.charges.new', view: 'app/business/charges/charges-new.html' },
        { name: 'business.charges.detail', view: 'app/business/charges/charges-detail.html' },
        { name: 'datahub', view: 'app/layout/container.html' },
        { name: 'datahub.orderdata', view: 'app/datahub/orderdata/orderdata-list.html' },
        { name: 'datahub.clientdata', view: 'app/datahub/clientdata/clientdata-list.html' },
        { name: 'finance', view: 'app/layout/container.html' },
        { name: 'finance.bills', view: 'app/finance/bills/bills-list.html' },
        { name: 'finance.bills.detail', view: 'app/finance/bills/bills-detail.html' },
        { name: 'finance.bills.detail.charge', view: 'app/finance/bills/bills-charge.html' },
        { name: 'finance.transactions', view: 'app/finance/transactions/transactions-list.html' },
        { name: 'finance.transactions.new', view: 'app/finance/transactions/transactions-new.html' },
        { name: 'finance.refunds', view: 'app/finance/refunds/refunds-list.html' },
        { name: 'finance.refunds.new', view: 'app/finance/refunds/refunds-new.html' },
        { name: 'finance.refunds.detail', view: 'app/finance/refunds/refunds-detail.html' },
        { name: 'finance.orderin', view: 'app/finance/orderin/orderin.html' },
        { name: 'finance.details', view: 'app/finance/details/details-list.html' },
        { name: 'finance.details.deal', view: 'app/finance/details/details-deal.html' },
        { name: 'finance.details.new', view: 'app/finance/details/details-new.html' },
        { name: 'finance.debts', view: 'app/finance/debts/debts-list.html' },
        { name: 'finance.income', view: 'app/finance/income/income-list.html' },
        { name: 'admin', view: 'app/layout/container.html' },
        { name: 'admin.log', view: 'app/admin/views/log.html' },
        { name: 'admin.roles', view: 'app/admin/views/roles.html' },
        { name: 'admin.roles_create', view: 'app/admin/views/create_role.html' },
        { name: 'admin.roles_edit', view: 'app/admin/views/create_role.html' },
        { name: 'admin.staffs', view: 'app/admin/views/staffs.html' },
      ],
      modules: [
        {
          name: 'echarts',
          files: ['vendor/echarts-all.js',
                  'vendor/angular-echarts.min.js']}
      ]
    }
  }

  function getAppDataMap() {
    return {
      registered_status: {1: '注册客户', 0: '潜在客户'},
      drop_reasons: { 1: '不需要', 2: '不对口', 3: '未备案', 4: '联系不上', 5: '价格问题', 6: '功能问题', 7: '选择其他服务', 8: '项目未完成'
      , 9: '目前量不大', 10: '其他' , 11:'长时间未联系，系统自动丢弃使用', 12: '重复帐号' },
      client_status: { 'untreated': '未处理', 'contacted': '已联系', 'need_follow': '需跟进', 'fail': '失败' },
      order_status: { 'INIT': '待付款', 'DONE': '已付款', 'CANCEL': '已取消', 'GIFT': '系统赠送', 'REFUND': '已退款' },
      order_type: { 'ORDER_TYPE_NORMAL': '正常购买', 'ORDER_TYPE_HTTPS': 'HTTPS 订单', 'MONTH_PAY': '按月结算', 'SYS_GIFT': '系统赠送', 'REPARATION': '服务补偿' },
      pay_type: { 'alipay': '支付宝支付', 'offline_bank': '线下银行打款', 'offline_cash': '线下现金支付', 'system': '系统处理', 'other': '其他' },
      account_status: { 'UNAUTH': '未认证', 'TRIAL': '试用中', 'NORMAL': '服务中', 'OVERDUE': '欠费中', 'DISABLED': '欠费停用', 'LOCKED': '人工停用', 'BLOCKED': '人工禁用' },
      search_key_types: { 'username': '云存储帐号', 'name': '客户名称', 'bucket': '空间名', 'domain': '网站域名', 'contact': '联系人'
      , 'cellphone': '手机', 'email': '邮箱', 'qq': 'QQ', 'order_number': '订单号', 'order_id': '充值编号', 'bill_id': '账单编号' },
      contact_modes: { 1: '在线', 2: '电话', 3: '上门' },
      contact_types: { 1: '发展客户', 2: '业务合作', 3: '客户合作', 4: '节日慰问', 5: '续费联系' },
      contact_status: { 1: '联系成功', 0: '联系失败' },
      buy_types: { 'no_buy': '未购买', 'first_year': '首年客户', 'second_year': '次年客户' },
      invoice_type: { 'VAT_PRO': '增值税专用发票', 'VAT_NORMAL': '增值税普通发票' },
      region: { '1': '华北地区', '2': '华东地区', '3': '华南地区', '4': '港澳台地区', '6': '海外地区' },
      regions: { '[1]': '华北地区', '[2]': '华东地区', '[3]': '华南地区', '[4]': '港澳台地区', '[6]': '海外地区' },
      charge_type: { 'PRE_PAY': '预付费', 'DELAY_PAY': '后付费' },
      period_type: { 'DAILY': '按日结算', 'MONTHLY': '按月结算' },
      charge_conf_status: { 'PASS': '已启用', 'REJECT': '审核拒绝', 'INIT': '待审核' },
      service_type: { 'FLOW': '流量', 'BANDWIDTH': '带宽', 'STORAGE': '存储', 'HTTPSs': 'HTTPS', '动态流出': 'CDN_REQUEST_COUNT' },
      pay_period_unit: { 'DAY': '天', 'WEEK': '周', 'MONTH': '月', 'SEASON': '季度' },
      company: { 'BEIJING': '北京公司', 'SHANGHAI': '上海公司', 'HOMELESS': '无所属公司' },
      account_type: { 'COMPANY': '企业', 'PERSONAL': '个人' },
      trans_types: {RECHARGE: '账户加款', CASH: '余额提现', RESOURCE: '资源购买', DAY_BILL: '日账单扣款', MONTH_BILL: '月账单扣款',},
      call_type: {'IN': 'call_in', 'OUT': 'call_out' },
    }
  }

  function getAppCons() {
    return {
      companys: [

      ]
    }
  }

  function getLocation() {
      return [{ "name": "北京市", "id": 110000, "sub": [{ "id": 110101, "name": "东城区" }, { "id": 110102, "name": "西城区" }, { "id": 110105, "name": "朝阳区" }, { "id": 110106, "name": "丰台区" }, { "id": 110107, "name": "石景山区" }, { "id": 110108, "name": "海淀区" }, { "id": 110109, "name": "门头沟区" }, { "id": 110111, "name": "房山区" }, { "id": 110112, "name": "通州区" }, { "id": 110113, "name": "顺义区" }, { "id": 110114, "name": "昌平区" }, { "id": 110115, "name": "大兴区" }, { "id": 110116, "name": "怀柔区" }, { "id": 110117, "name": "平谷区" }, { "id": 110228, "name": "密云县" }, { "id": 110229, "name": "延庆县" }], "type": 1 }, { "name": "天津市", "id": 120000, "sub": [{ "id": 120101, "name": "和平区" }, { "id": 120102, "name": "河东区" }, { "id": 120103, "name": "河西区" }, { "id": 120104, "name": "南开区" }, { "id": 120105, "name": "河北区" }, { "id": 120106, "name": "红桥区" }, { "id": 120110, "name": "东丽区" }, { "id": 120111, "name": "西青区" }, { "id": 120112, "name": "津南区" }, { "id": 120113, "name": "北辰区" }, { "id": 120114, "name": "武清区" }, { "id": 120115, "name": "宝坻区" }, { "id": 120116, "name": "滨海新区" }, { "id": 120221, "name": "宁河县" }, { "id": 120223, "name": "静海县" }, { "id": 120225, "name": "蓟县" }], "type": 1 }, { "name": "河北省", "id": 130000, "sub": [{ "id": 130100, "name": "石家庄市" }, { "id": 130200, "name": "唐山市" }, { "id": 130300, "name": "秦皇岛市" }, { "id": 130400, "name": "邯郸市" }, { "id": 130500, "name": "邢台市" }, { "id": 130600, "name": "保定市" }, { "id": 130700, "name": "张家口市" }, { "id": 130800, "name": "承德市" }, { "id": 130900, "name": "沧州市" }, { "id": 131000, "name": "廊坊市" }, { "id": 131100, "name": "衡水市" }], "type": 1 }, { "name": "山西省", "id": 140000, "sub": [{ "id": 140100, "name": "太原市" }, { "id": 140200, "name": "大同市" }, { "id": 140300, "name": "阳泉市" }, { "id": 140400, "name": "长治市" }, { "id": 140500, "name": "晋城市" }, { "id": 140600, "name": "朔州市" }, { "id": 140700, "name": "晋中市" }, { "id": 140800, "name": "运城市" }, { "id": 140900, "name": "忻州市" }, { "id": 141000, "name": "临汾市" }, { "id": 141100, "name": "吕梁市" }], "type": 1 }, { "name": "内蒙古自治区", "id": 150000, "sub": [{ "id": 150100, "name": "呼和浩特市" }, { "id": 150200, "name": "包头市" }, { "id": 150300, "name": "乌海市" }, { "id": 150400, "name": "赤峰市" }, { "id": 150500, "name": "通辽市" }, { "id": 150600, "name": "鄂尔多斯市" }, { "id": 150700, "name": "呼伦贝尔市" }, { "id": 150800, "name": "巴彦淖尔市" }, { "id": 150900, "name": "乌兰察布市" }, { "id": 152200, "name": "兴安盟" }, { "id": 152500, "name": "锡林郭勒盟" }, { "id": 152900, "name": "阿拉善盟" }], "type": 1 }, { "name": "辽宁省", "id": 210000, "sub": [{ "id": 210100, "name": "沈阳市" }, { "id": 210200, "name": "大连市" }, { "id": 210300, "name": "鞍山市" }, { "id": 210400, "name": "抚顺市" }, { "id": 210500, "name": "本溪市" }, { "id": 210600, "name": "丹东市" }, { "id": 210700, "name": "锦州市" }, { "id": 210800, "name": "营口市" }, { "id": 210900, "name": "阜新市" }, { "id": 211000, "name": "辽阳市" }, { "id": 211100, "name": "盘锦市" }, { "id": 211200, "name": "铁岭市" }, { "id": 211300, "name": "朝阳市" }, { "id": 211400, "name": "葫芦岛市" }], "type": 1 }, { "name": "吉林省", "id": 220000, "sub": [{ "id": 220100, "name": "长春市" }, { "id": 220200, "name": "吉林市" }, { "id": 220300, "name": "四平市" }, { "id": 220400, "name": "辽源市" }, { "id": 220500, "name": "通化市" }, { "id": 220600, "name": "白山市" }, { "id": 220700, "name": "松原市" }, { "id": 220800, "name": "白城市" }, { "id": 222400, "name": "延边朝鲜族自治州" }], "type": 1 }, { "name": "黑龙江省", "id": 230000, "sub": [{ "id": 230100, "name": "哈尔滨市" }, { "id": 230200, "name": "齐齐哈尔市" }, { "id": 230300, "name": "鸡西市" }, { "id": 230400, "name": "鹤岗市" }, { "id": 230500, "name": "双鸭山市" }, { "id": 230600, "name": "大庆市" }, { "id": 230700, "name": "伊春市" }, { "id": 230800, "name": "佳木斯市" }, { "id": 230900, "name": "七台河市" }, { "id": 231000, "name": "牡丹江市" }, { "id": 231100, "name": "黑河市" }, { "id": 231200, "name": "绥化市" }, { "id": 232700, "name": "大兴安岭地区" }], "type": 1 }, { "name": "上海市", "id": 310000, "sub": [{ "id": 310101, "name": "黄浦区" }, { "id": 310104, "name": "徐汇区" }, { "id": 310105, "name": "长宁区" }, { "id": 310106, "name": "静安区" }, { "id": 310107, "name": "普陀区" }, { "id": 310108, "name": "闸北区" }, { "id": 310109, "name": "虹口区" }, { "id": 310110, "name": "杨浦区" }, { "id": 310112, "name": "闵行区" }, { "id": 310113, "name": "宝山区" }, { "id": 310114, "name": "嘉定区" }, { "id": 310115, "name": "浦东新区" }, { "id": 310116, "name": "金山区" }, { "id": 310117, "name": "松江区" }, { "id": 310118, "name": "青浦区" }, { "id": 310120, "name": "奉贤区" }, { "id": 310230, "name": "崇明县" }], "type": 1 }, { "name": "江苏省", "id": 320000, "sub": [{ "id": 320100, "name": "南京市" }, { "id": 320200, "name": "无锡市" }, { "id": 320300, "name": "徐州市" }, { "id": 320400, "name": "常州市" }, { "id": 320500, "name": "苏州市" }, { "id": 320600, "name": "南通市" }, { "id": 320700, "name": "连云港市" }, { "id": 320800, "name": "淮安市" }, { "id": 320900, "name": "盐城市" }, { "id": 321000, "name": "扬州市" }, { "id": 321100, "name": "镇江市" }, { "id": 321200, "name": "泰州市" }, { "id": 321300, "name": "宿迁市" }], "type": 1 }, { "name": "浙江省", "id": 330000, "sub": [{ "id": 330100, "name": "杭州市" }, { "id": 330200, "name": "宁波市" }, { "id": 330300, "name": "温州市" }, { "id": 330400, "name": "嘉兴市" }, { "id": 330500, "name": "湖州市" }, { "id": 330600, "name": "绍兴市" }, { "id": 330700, "name": "金华市" }, { "id": 330800, "name": "衢州市" }, { "id": 330900, "name": "舟山市" }, { "id": 331000, "name": "台州市" }, { "id": 331100, "name": "丽水市" }], "type": 1 }, { "name": "安徽省", "id": 340000, "sub": [{ "id": 340100, "name": "合肥市" }, { "id": 340200, "name": "芜湖市" }, { "id": 340300, "name": "蚌埠市" }, { "id": 340400, "name": "淮南市" }, { "id": 340500, "name": "马鞍山市" }, { "id": 340600, "name": "淮北市" }, { "id": 340700, "name": "铜陵市" }, { "id": 340800, "name": "安庆市" }, { "id": 341000, "name": "黄山市" }, { "id": 341100, "name": "滁州市" }, { "id": 341200, "name": "阜阳市" }, { "id": 341300, "name": "宿州市" }, { "id": 341500, "name": "六安市" }, { "id": 341600, "name": "亳州市" }, { "id": 341700, "name": "池州市" }, { "id": 341800, "name": "宣城市" }], "type": 1 }, { "name": "福建省", "id": 350000, "sub": [{ "id": 350100, "name": "福州市" }, { "id": 350200, "name": "厦门市" }, { "id": 350300, "name": "莆田市" }, { "id": 350400, "name": "三明市" }, { "id": 350500, "name": "泉州市" }, { "id": 350600, "name": "漳州市" }, { "id": 350700, "name": "南平市" }, { "id": 350800, "name": "龙岩市" }, { "id": 350900, "name": "宁德市" }], "type": 1 }, { "name": "江西省", "id": 360000, "sub": [{ "id": 360100, "name": "南昌市" }, { "id": 360200, "name": "景德镇市" }, { "id": 360300, "name": "萍乡市" }, { "id": 360400, "name": "九江市" }, { "id": 360500, "name": "新余市" }, { "id": 360600, "name": "鹰潭市" }, { "id": 360700, "name": "赣州市" }, { "id": 360800, "name": "吉安市" }, { "id": 360900, "name": "宜春市" }, { "id": 361000, "name": "抚州市" }, { "id": 361100, "name": "上饶市" }], "type": 1 }, { "name": "山东省", "id": 370000, "sub": [{ "id": 370100, "name": "济南市" }, { "id": 370200, "name": "青岛市" }, { "id": 370300, "name": "淄博市" }, { "id": 370400, "name": "枣庄市" }, { "id": 370500, "name": "东营市" }, { "id": 370600, "name": "烟台市" }, { "id": 370700, "name": "潍坊市" }, { "id": 370800, "name": "济宁市" }, { "id": 370900, "name": "泰安市" }, { "id": 371000, "name": "威海市" }, { "id": 371100, "name": "日照市" }, { "id": 371200, "name": "莱芜市" }, { "id": 371300, "name": "临沂市" }, { "id": 371400, "name": "德州市" }, { "id": 371500, "name": "聊城市" }, { "id": 371600, "name": "滨州市" }, { "id": 371700, "name": "菏泽市" }], "type": 1 }, { "name": "河南省", "id": 410000, "sub": [{ "id": 410100, "name": "郑州市" }, { "id": 410200, "name": "开封市" }, { "id": 410300, "name": "洛阳市" }, { "id": 410400, "name": "平顶山市" }, { "id": 410500, "name": "安阳市" }, { "id": 410600, "name": "鹤壁市" }, { "id": 410700, "name": "新乡市" }, { "id": 410800, "name": "焦作市" }, { "id": 410900, "name": "濮阳市" }, { "id": 411000, "name": "许昌市" }, { "id": 411100, "name": "漯河市" }, { "id": 411200, "name": "三门峡市" }, { "id": 411300, "name": "南阳市" }, { "id": 411400, "name": "商丘市" }, { "id": 411500, "name": "信阳市" }, { "id": 411600, "name": "周口市" }, { "id": 411700, "name": "驻马店市" }, { "id": 419000, "name": "省直辖县级行政区划" }], "type": 1 }, { "name": "湖北省", "id": 420000, "sub": [{ "id": 420100, "name": "武汉市" }, { "id": 420200, "name": "黄石市" }, { "id": 420300, "name": "十堰市" }, { "id": 420500, "name": "宜昌市" }, { "id": 420600, "name": "襄阳市" }, { "id": 420700, "name": "鄂州市" }, { "id": 420800, "name": "荆门市" }, { "id": 420900, "name": "孝感市" }, { "id": 421000, "name": "荆州市" }, { "id": 421100, "name": "黄冈市" }, { "id": 421200, "name": "咸宁市" }, { "id": 421300, "name": "随州市" }, { "id": 422800, "name": "恩施土家族苗族自治州" }, { "id": 429000, "name": "省直辖县级行政区划" }], "type": 1 }, { "name": "湖南省", "id": 430000, "sub": [{ "id": 430100, "name": "长沙市" }, { "id": 430200, "name": "株洲市" }, { "id": 430300, "name": "湘潭市" }, { "id": 430400, "name": "衡阳市" }, { "id": 430500, "name": "邵阳市" }, { "id": 430600, "name": "岳阳市" }, { "id": 430700, "name": "常德市" }, { "id": 430800, "name": "张家界市" }, { "id": 430900, "name": "益阳市" }, { "id": 431000, "name": "郴州市" }, { "id": 431100, "name": "永州市" }, { "id": 431200, "name": "怀化市" }, { "id": 431300, "name": "娄底市" }, { "id": 433100, "name": "湘西土家族苗族自治州" }], "type": 1 }, { "name": "广东省", "id": 440000, "sub": [{ "id": 440100, "name": "广州市" }, { "id": 440200, "name": "韶关市" }, { "id": 440300, "name": "深圳市" }, { "id": 440400, "name": "珠海市" }, { "id": 440500, "name": "汕头市" }, { "id": 440600, "name": "佛山市" }, { "id": 440700, "name": "江门市" }, { "id": 440800, "name": "湛江市" }, { "id": 440900, "name": "茂名市" }, { "id": 441200, "name": "肇庆市" }, { "id": 441300, "name": "惠州市" }, { "id": 441400, "name": "梅州市" }, { "id": 441500, "name": "汕尾市" }, { "id": 441600, "name": "河源市" }, { "id": 441700, "name": "阳江市" }, { "id": 441800, "name": "清远市" }, { "id": 441900, "name": "东莞市" }, { "id": 442000, "name": "中山市" }, { "id": 445100, "name": "潮州市" }, { "id": 445200, "name": "揭阳市" }, { "id": 445300, "name": "云浮市" }], "type": 1 }, { "name": "广西壮族自治区", "id": 450000, "sub": [{ "id": 450100, "name": "南宁市" }, { "id": 450200, "name": "柳州市" }, { "id": 450300, "name": "桂林市" }, { "id": 450400, "name": "梧州市" }, { "id": 450500, "name": "北海市" }, { "id": 450600, "name": "防城港市" }, { "id": 450700, "name": "钦州市" }, { "id": 450800, "name": "贵港市" }, { "id": 450900, "name": "玉林市" }, { "id": 451000, "name": "百色市" }, { "id": 451100, "name": "贺州市" }, { "id": 451200, "name": "河池市" }, { "id": 451300, "name": "来宾市" }, { "id": 451400, "name": "崇左市" }], "type": 1 }, { "name": "海南省", "id": 460000, "sub": [{ "id": 460100, "name": "海口市" }, { "id": 460200, "name": "三亚市" }, { "id": 460300, "name": "三沙市" }, { "id": 469000, "name": "省直辖县级行政区划" }], "type": 1 }, { "name": "重庆市", "id": 500000, "sub": [{ "id": 500101, "name": "万州区" }, { "id": 500102, "name": "涪陵区" }, { "id": 500103, "name": "渝中区" }, { "id": 500104, "name": "大渡口区" }, { "id": 500105, "name": "江北区" }, { "id": 500106, "name": "沙坪坝区" }, { "id": 500107, "name": "九龙坡区" }, { "id": 500108, "name": "南岸区" }, { "id": 500109, "name": "北碚区" }, { "id": 500110, "name": "綦江区" }, { "id": 500111, "name": "大足区" }, { "id": 500112, "name": "渝北区" }, { "id": 500113, "name": "巴南区" }, { "id": 500114, "name": "黔江区" }, { "id": 500115, "name": "长寿区" }, { "id": 500116, "name": "江津区" }, { "id": 500117, "name": "合川区" }, { "id": 500118, "name": "永川区" }, { "id": 500119, "name": "南川区" }, { "id": 500223, "name": "潼南县" }, { "id": 500224, "name": "铜梁县" }, { "id": 500226, "name": "荣昌县" }, { "id": 500227, "name": "璧山县" }, { "id": 500228, "name": "梁平县" }, { "id": 500229, "name": "城口县" }, { "id": 500230, "name": "丰都县" }, { "id": 500231, "name": "垫江县" }, { "id": 500232, "name": "武隆县" }, { "id": 500233, "name": "忠县" }, { "id": 500234, "name": "开县" }, { "id": 500235, "name": "云阳县" }, { "id": 500236, "name": "奉节县" }, { "id": 500237, "name": "巫山县" }, { "id": 500238, "name": "巫溪县" }, { "id": 500240, "name": "石柱土家族自治县" }, { "id": 500241, "name": "秀山土家族苗族自治县" }, { "id": 500242, "name": "酉阳土家族苗族自治县" }, { "id": 500243, "name": "彭水苗族土家族自治县" }], "type": 1 }, { "name": "四川省", "id": 510000, "sub": [{ "id": 510100, "name": "成都市" }, { "id": 510300, "name": "自贡市" }, { "id": 510400, "name": "攀枝花市" }, { "id": 510500, "name": "泸州市" }, { "id": 510600, "name": "德阳市" }, { "id": 510700, "name": "绵阳市" }, { "id": 510800, "name": "广元市" }, { "id": 510900, "name": "遂宁市" }, { "id": 511000, "name": "内江市" }, { "id": 511100, "name": "乐山市" }, { "id": 511300, "name": "南充市" }, { "id": 511400, "name": "眉山市" }, { "id": 511500, "name": "宜宾市" }, { "id": 511600, "name": "广安市" }, { "id": 511700, "name": "达州市" }, { "id": 511800, "name": "雅安市" }, { "id": 511900, "name": "巴中市" }, { "id": 512000, "name": "资阳市" }, { "id": 513200, "name": "阿坝藏族羌族自治州" }, { "id": 513300, "name": "甘孜藏族自治州" }, { "id": 513400, "name": "凉山彝族自治州" }], "type": 1 }, { "name": "贵州省", "id": 520000, "sub": [{ "id": 520100, "name": "贵阳市" }, { "id": 520200, "name": "六盘水市" }, { "id": 520300, "name": "遵义市" }, { "id": 520400, "name": "安顺市" }, { "id": 520500, "name": "毕节市" }, { "id": 520600, "name": "铜仁市" }, { "id": 522300, "name": "黔西南布依族苗族自治州" }, { "id": 522600, "name": "黔东南苗族侗族自治州" }, { "id": 522700, "name": "黔南布依族苗族自治州" }], "type": 1 }, { "name": "云南省", "id": 530000, "sub": [{ "id": 530100, "name": "昆明市" }, { "id": 530300, "name": "曲靖市" }, { "id": 530400, "name": "玉溪市" }, { "id": 530500, "name": "保山市" }, { "id": 530600, "name": "昭通市" }, { "id": 530700, "name": "丽江市" }, { "id": 530800, "name": "普洱市" }, { "id": 530900, "name": "临沧市" }, { "id": 532300, "name": "楚雄彝族自治州" }, { "id": 532500, "name": "红河哈尼族彝族自治州" }, { "id": 532600, "name": "文山壮族苗族自治州" }, { "id": 532800, "name": "西双版纳傣族自治州" }, { "id": 532900, "name": "大理白族自治州" }, { "id": 533100, "name": "德宏傣族景颇族自治州" }, { "id": 533300, "name": "怒江傈僳族自治州" }, { "id": 533400, "name": "迪庆藏族自治州" }], "type": 1 }, { "name": "西藏自治区", "id": 540000, "sub": [{ "id": 540100, "name": "拉萨市" }, { "id": 542100, "name": "昌都地区" }, { "id": 542200, "name": "山南地区" }, { "id": 542300, "name": "日喀则地区" }, { "id": 542400, "name": "那曲地区" }, { "id": 542500, "name": "阿里地区" }, { "id": 542600, "name": "林芝地区" }], "type": 1 }, { "name": "陕西省", "id": 610000, "sub": [{ "id": 610100, "name": "西安市" }, { "id": 610200, "name": "铜川市" }, { "id": 610300, "name": "宝鸡市" }, { "id": 610400, "name": "咸阳市" }, { "id": 610500, "name": "渭南市" }, { "id": 610600, "name": "延安市" }, { "id": 610700, "name": "汉中市" }, { "id": 610800, "name": "榆林市" }, { "id": 610900, "name": "安康市" }, { "id": 611000, "name": "商洛市" }], "type": 1 }, { "name": "甘肃省", "id": 620000, "sub": [{ "id": 620100, "name": "兰州市" }, { "id": 620200, "name": "嘉峪关市" }, { "id": 620300, "name": "金昌市" }, { "id": 620400, "name": "白银市" }, { "id": 620500, "name": "天水市" }, { "id": 620600, "name": "武威市" }, { "id": 620700, "name": "张掖市" }, { "id": 620800, "name": "平凉市" }, { "id": 620900, "name": "酒泉市" }, { "id": 621000, "name": "庆阳市" }, { "id": 621100, "name": "定西市" }, { "id": 621200, "name": "陇南市" }, { "id": 622900, "name": "临夏回族自治州" }, { "id": 623000, "name": "甘南藏族自治州" }], "type": 1 }, { "name": "青海省", "id": 630000, "sub": [{ "id": 630100, "name": "西宁市" }, { "id": 630200, "name": "海东市" }, { "id": 632200, "name": "海北藏族自治州" }, { "id": 632300, "name": "黄南藏族自治州" }, { "id": 632500, "name": "海南藏族自治州" }, { "id": 632600, "name": "果洛藏族自治州" }, { "id": 632700, "name": "玉树藏族自治州" }, { "id": 632800, "name": "海西蒙古族藏族自治州" }], "type": 1 }, { "name": "宁夏回族自治区", "id": 640000, "sub": [{ "id": 640100, "name": "银川市" }, { "id": 640200, "name": "石嘴山市" }, { "id": 640300, "name": "吴忠市" }, { "id": 640400, "name": "固原市" }, { "id": 640500, "name": "中卫市" }], "type": 1 }, { "name": "新疆维吾尔自治区", "id": 650000, "sub": [{ "id": 650100, "name": "乌鲁木齐市" }, { "id": 650200, "name": "克拉玛依市" }, { "id": 652100, "name": "吐鲁番地区" }, { "id": 652200, "name": "哈密地区" }, { "id": 652300, "name": "昌吉回族自治州" }, { "id": 652700, "name": "博尔塔拉蒙古自治州" }, { "id": 652800, "name": "巴音郭楞蒙古自治州" }, { "id": 652900, "name": "阿克苏地区" }, { "id": 653000, "name": "克孜勒苏柯尔克孜自治州" }, { "id": 653100, "name": "喀什地区" }, { "id": 653200, "name": "和田地区" }, { "id": 654000, "name": "伊犁哈萨克自治州" }, { "id": 654200, "name": "塔城地区" }, { "id": 654300, "name": "阿勒泰地区" }, { "id": 659000, "name": "自治区直辖县级行政区划" }], "type": 1 }, { "name": "台湾省", "id": 710000, "sub": [], "type": 0 }, { "name": "香港特别行政区", "id": 810000, "sub": [], "type": 0 }, { "name": "澳门特别行政区", "id": 820000, "sub": [], "type": 0 }, { "name": "海外", "id": 100000, "sub": [], "type": 0 }]
    }
})()