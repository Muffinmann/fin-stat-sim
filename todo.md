[] 每次变动，显示变化，+/-或上下箭头
[] 点击参数输入，高亮受影响的地方
[] 允许把当前参数设为基准
[] 灵敏度里的项目可以被自定义
[] 目标 推荐 参数 （goal seek)
  A. Goal Seek
  输入一个目标值，只反推一个参数。
  比如：
  - 想让 Year 5 EBIT margin = 30%，需要把 price per cup 提到多少？
  - 想让 Year 5 ending cash >= 0，需要 Year 1 债务至少发多少？

  B. Multi-Parameter Optimizer
  同时调整多个可控参数，在约束条件下找最好解。
  比如：
  - 目标：Year 5 EBIT margin >= 30%
  - 约束：每年提价不超过 8%，销量增长不超过 10%，人工成本不能低于某值，不能新增股权融资
  - 优化：Ending cash 最大，或 debt 最小

  C. Frontier / Tradeoff
  不是给一个答案，而是给一组“边界解”。
  例如：
  - 如果不想增发，就必须提价到多少
  - 如果不想大幅提价，就必须放慢扩张
  - 如果想同时保住现金，就要接受 EBIT margin 低一点
