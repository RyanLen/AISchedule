function scheduleHtmlParser(html) {
  //除函数名外都可编辑
  //传入的参数为上一步函数获取到的html
  //可使用正则匹配
  //可使用解析dom匹配，工具内置了$，跟jquery使用方法一样，直接用就可以了，参考：https://juejin.im/post/5ea131f76fb9a03c8122d6b9
  //以下为示例，您可以完全重写或在此基础上更改
  const timeTable = [
    ["08:00", "08:45"], // startTime, endTime
    ["08:55", "09:40"],
    ["10:00", "10：45"],
    ["10:55", "11:40"],
    ["14:00", "14:45"],
    ["14:50", "15:35"],
    ["15:55", "16:40"],
    ["16:45", "17:30"],
    ["18:50", "20:15"],
    ["20:20", "21:05"],
    ["21:10", "21:55"],
    ["22:00", "22:45"],
  ];
  const sectionTimes = timeTable.reduce(
    (pre, cur, i) => [
      ...pre,
      {
        section: i + 1,
        startTime: cur[0],
        endTime: cur[1],
      },
    ],
    []
  );
  const courseInfos = [];

  html = html.replace(/[\r\n]/g, "");

  const $ = cheerio.load(html, { decodeEntities: false });
  const trs = $("table#kbtable>tbody>tr");

  trs.each((row, tr) => {
    const tds = $(tr).children("td");

    if (!tds.length) return;

    tds.each((col, td) => {
      const content = $(td).children(".kbcontent").first();
      const item = $(content).children("font[title=老师]");

      item.each((i, teacher) => {
        const courseInfo = {
          day: col + 1,
          name: null,
          teacher: $(teacher).text().trim(),
          sections: null,
          position: $(teacher)
            .nextAll("font[title=教室]")
            .first()
            .text()
            .trim(),
          weeks: null,
        };

        const el = teacher.prev.prev;
        if (el.type === "text") {
          courseInfo.name = el.data.trim();
        } else if (el.type === "tag" && el.name === "span") {
          courseInfo.name = el.prev.data;
          // O表示整体调课，P表示部分调课
          //           courseInfo.status = $(el).children().first().text().trim();
        }
        const timeStr = $(teacher)
          .nextAll("font[title='周次(节次)']")
          .first()
          .text()
          .trim();
        let [weeks, sections] = timeStr.split("(周)[");
        courseInfo.weeks = weeks.split(",").reduce((pre, cur) => {
          let [begin, end = -1] = cur.split("-").map((val) => parseInt(val));
          if (end === -1) return [begin];
          return [
            ...new Set([...pre, ...[...Array(end + 1).keys()].slice(begin)]),
          ];
        }, []);
        courseInfo.sections = sections
          .replace("]", "")
          .split("-")
          .map((val) => sectionTimes.find((v) => v.section === parseInt(val)));
        courseInfos.push(courseInfo);
      });
    });
  });

  return {
    courseInfos: courseInfos.sort((a, b) => a.day - b.day),
    sectionTimes,
  };
}
