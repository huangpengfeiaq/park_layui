layui.use(['form', 'layer', 'table'], function () {
        const form = layui.form,
            layer = parent.layer === undefined ? layui.layer : top.layer,
            $ = layui.jquery,
            table = layui.table;

        //列表
        const tableIns = table.render({
            elem: '#list',
            url: $.cookie("tempUrl") + 'park/selectList',
            where: {token: $.cookie("token")},
            method: "GET",
            request: {
                pageName: 'pageNum' //页码的参数名称，默认：page
                , limitName: 'pageSize' //每页数据量的参数名，默认：limit
            },
            response: {
                statusName: 'code' //数据状态的字段名称，默认：code
                , statusCode: 0 //成功的状态码，默认：0
                , msgName: 'httpStatus' //状态信息的字段名称，默认：msg
                , countName: 'totalElements' //数据总数的字段名称，默认：count
                , dataName: 'content' //数据列表的字段名称，默认：data
            },
            cellMinWidth: 95,
            page: true,
            height: "full-25",
            limits: [5, 10, 15, 20, 25],
            limit: 15,
            id: "dataTable",
            toolbar: '#toolbarDemo',
            defaultToolbar: [],
            cols: [[
                {field: 'parkId', title: 'ID', width: 90, align: 'center'},
                {
                    field: 'name', title: '园区名称', minWidth: 200, align: "left", templet: function (d) {
                        return '<a lay-event="look" style="cursor:pointer;color: #01AAED">' + d.name + '</a>';
                    }
                },
                {
                    field: 'areaName', title: '归属地', minWidth: 300, align: "left", templet: function (d) {
                        return d.areaName;
                    }
                },
                {field: 'address', title: '详细地址', minWidth: 300, align: 'left'},
                // {field: 'introduction', title: 'introduction', minWidth: 300, align: 'left'},
                // {field: 'sort', title: '排序', minWidth: 300, align: 'left'},
                {
                    field: 'createDate', title: '创建时间', width: 200, align: "center", templet: function (d) {
                        return d.createDate;
                    }
                },
                {
                    field: 'status', title: '状态', width: 100, align: 'center', templet: function (d) {
                        if (d.status === 1) {
                            return '<input type="checkbox" lay-filter="status" lay-skin="switch" value=' + d.parkId + ' lay-text="正常|待审核" checked>';
                        } else if (d.status === 0) {
                            return '<input type="checkbox" lay-filter="status" lay-skin="switch" value=' + d.parkId + ' lay-text="正常|待审核" >';
                        }
                    }
                },
                {title: '操作', width: 145, templet: '#userListBar', fixed: "right", align: "center"}
            ]]
        });

        //头工具栏事件
        table.on('toolbar(test)', function (obj) {
            const checkStatus = table.checkStatus(obj.config.id);
            switch (obj.event) {
                case 'search_btn':
                    layer.msg("搜索功能还未完成，将在下一版更新");
                    // table.reload("dataTable", {
                    //     url: $.cookie("tempUrl") + 'park/selectListByTitle',
                    //     where: {
                    //         title: $(".searchVal").val(),
                    //         token: $.cookie("token")
                    //     }
                    // });
                    break;
                case 'flash_btn':
                    window.location.reload();
                    break;
                case 'add_btn':
                    const index = layui.layer.open({
                        title: "新增园区",
                        type: 2,
                        area: ["900px", "500px"],
                        shadeClose: true,
                        maxmin: true,
                        content: "parkAdd.html"
                    });
                    break;
            }
        });

        // 修改状态开关
        form.on('switch(status)', function (data) {
            $.ajax({
                url: $.cookie("tempUrl") + "park/updateStatus?token=" + $.cookie("token"),
                type: "PUT",
                datatype: "application/json",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify({
                    "id": data.value,
                    "status": data.elem.checked ? "1" : "0"
                }),
                success: function (result) {
                    if (result.httpStatus === 200) {
                        layer.msg("状态修改成功");
                    } else {
                        layer.alert(result.exception, {icon: 7, anim: 6});
                    }
                }
            });
        });

        //列表操作
        table.on('tool(test)', function (obj) {
            const layEvent = obj.event,
                data = obj.data;
            let index;
            switch (layEvent) {
                case 'look'://查看详情
                    sessionStorage.setItem("parkId", data.parkId);
                    index = layui.layer.open({
                        title: data.name + "下的应用列表",
                        type: 2,
                        area: ["700px", "500px"],
                        shadeClose: true,
                        maxmin: true,
                        content: "../parkApp/parkAppList.html"
                    });
                    break;
                case 'edit'://编辑
                    sessionStorage.setItem("location", data.location);
                    index = layui.layer.open({
                        title: "查看/更新园区",
                        type: 2,
                        area: ["900px", "500px"],
                        shadeClose: true,
                        maxmin: true,
                        content: "parkUpd.html",
                        success: function (layero, index) {
                            const body = layui.layer.getChildFrame('body', index);
                            body.find(".id").val(data.parkId);
                            body.find(".name").val(data.name);
                            // body.find(".area").val(data.location);
                            body.find(".address").val(data.address);
                            body.find(".introduction").val(data.introduction);
                            body.find(".createDate").val(data.createDate);
                            body.find("#demo1").attr("src", data.logo);  //封面图
                            form.render();
                        }
                    });
                    break;
                case 'del'://删除
                    layer.confirm('确定删除此园区？', {icon: 3, title: '提示信息'}, function (index) {
                        $.ajax({
                            url: $.cookie("tempUrl") + "park/deleteByPrimaryKey?token=" + $.cookie("token") + "&id=" + data.parkId,
                            type: "DELETE",
                            success: function (result) {
                                layer.msg("删除成功");
                                // window.location.href = "parkList.html";
                            }
                        });
                        obj.del(); //删除对应行（tr）的DOM结构，并更新缓存
                        // tableIns.reload();
                        layer.close(index);
                    });
                    break;
            }
        });
    }
);
