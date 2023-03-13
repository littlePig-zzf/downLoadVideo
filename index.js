// 引入 node-xlsx 模块
import { parse } from 'node-xlsx';
import ora from 'ora';
import { createWriteStream, mkdir } from 'fs';
import { get } from 'https';
// excel文件类径
const excelFilePath = './ip文案.xlsx'

//解析excel, 获取到所有sheets
const sheets = parse(excelFilePath);

sheets.map((citem) => {
    mkdir(`./video/${citem.name}`, function (err) {
        if (!err) {
            console.log('创建目标文件夹成功 🎉');
        }
    })
    download(citem)
})

function download(sheet) {
    let downloadUrl = []
    // 输出每行内容
    sheet.data.forEach(row => {
        if (!row[2] && row[3]) {
            downloadUrl.push({title: row[0], url: row[3]})
        }
        // 数组格式, 根据不同的索引取数据
    })
    if (downloadUrl?.length === 0) {
        console.log(`💢 ${sheet.name} 无数据！`);
        return
    }
    // console.log('===================', downloadUrl);
    console.log(sheet.name + '🚀 开始下载！');
    // Download the file
    downloadUrl?.map((item) => {
        get(item?.url, (res) => {
            // Open file in local filesystem
            const file = createWriteStream(`./video/${sheet?.name}/${item?.title}.mp4`);
            // Write data into local file
            res.pipe(file);

            // 添加加载动画
            const spinner = ora(`${item?.title} 🎉`);
            // 开始加载动画
            spinner.start();
            // Close the file
            file.on('finish', () => {
                file.close();
                spinner.succeed();
            });
        }).on("error", (err) => {
            console.log("💢 Error: ", err.message);
            spinner.fail('Request failed...')
        });
    })
}



