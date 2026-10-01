#!/bin/bash
# Performance test script: 10 keywords search response time

echo "=== 性能测试：10个关键词搜索响应时间 ==="
echo ""
printf "%-12s | %-10s | %-10s | %s\n" "关键词" "响应时间(ms)" "结果数" "状态"
echo "------------------------------------------------------"

keywords=("明月" "春风" "李白" "花" "水" "故乡" "相思" "夜" "酒" "山")

for kw in "${keywords[@]}"; do
  encoded=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$kw'))")
  start=$(date +%s%N)
  result=$(curl -s "http://localhost:3000/api/poems/search?q=$encoded")
  end=$(date +%s%N)
  elapsed=$(( (end - start) / 1000000 ))
  total=$(echo "$result" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['total'])" 2>/dev/null || echo "0")
  status="PASS"
  if [ "$elapsed" -gt 500 ]; then status="FAIL"; fi
  printf "%-12s | %-12s | %-10s | %s\n" "$kw" "${elapsed}" "$total" "$status"
done

echo ""
echo "=== 性能测试完成 ==="
