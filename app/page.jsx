"use client";

import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    import("../src/app.js");
  }, []);

  return (
    <main className="workbench">
      <section className="phone-shell" aria-label="HelloTalk mobile demo">
        <div className="phone" id="phone">
          <div className="statusbar">
            <span>9:41</span>
            <span className="status-icons">5G 100%</span>
          </div>
          <section id="app"></section>
        </div>
      </section>

      <aside className="control-panel" aria-label="Demo controls">
        <div className="panel-header">
          <p className="eyebrow">Codex Demo</p>
          <h1>Chat 顶部插件栏 Add More</h1>
        </div>

        <div className="control-block">
          <label className="toggle-row">
            <span>后台开关：原生半屏</span>
            <input id="nativeSwitch" type="checkbox" defaultChecked />
          </label>
          <label className="toggle-row">
            <span>模拟数量上限</span>
            <input id="maxSwitch" type="checkbox" />
          </label>
          <label className="toggle-row">
            <span>下一次添加失败</span>
            <input id="failSwitch" type="checkbox" />
          </label>
        </div>

        <div className="control-block">
          <button id="openAddMore" className="primary-button" type="button">打开 Add More</button>
          <button id="resetDemo" className="secondary-button" type="button">重置状态</button>
        </div>

        <div className="control-block">
          <p className="panel-title">验收覆盖</p>
          <ul className="check-list">
            <li>展开态默认展示 Add More</li>
            <li>开关关闭回退 LearnTab</li>
            <li>原生半屏支持搜索和上拉</li>
            <li>最近浏览、最近删除、推荐添加分组展示</li>
            <li>去重优先级：最近删除 &gt; 最近浏览 &gt; 推荐添加</li>
            <li>添加成功后保留弹层并刷新顶部栏</li>
          </ul>
        </div>
      </aside>
    </main>
  );
}
