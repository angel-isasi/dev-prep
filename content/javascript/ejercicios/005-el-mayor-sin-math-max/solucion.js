export function mayor(nums) {
  return nums.reduce((max, n) => (n > max ? n : max), nums[0]);
}
