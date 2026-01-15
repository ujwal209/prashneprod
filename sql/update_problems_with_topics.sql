-- Add topics column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'problems' AND column_name = 'topics') THEN
        ALTER TABLE public.problems ADD COLUMN topics TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Truncate existing problems to clean up seed data
TRUNCATE TABLE public.problems;

-- Seed Data with Topics (including Median of Two Sorted Arrays)
INSERT INTO public.problems (slug, title, difficulty, acceptance_rate, topics, description, starter_code)
VALUES 
(
    'two-sum',
    'Two Sum',
    'Easy',
    48.5,
    ARRAY['Array', 'Hash Table'],
    '# Two Sum

Given an array of integers `nums` and an integer `target`, return *indices of the two numbers such that they add up to `target`*.

You may assume that each input would have **exactly one solution**, and you may not use the *same* element twice.

You can return the answer in any order.

**Example 1:**
```
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
```
',
    '{"python": "def twoSum(nums: List[int], target: int) -> List[int]:\n    # Your code here\n    pass", "javascript": "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    \n};", "cpp": "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};"}'::jsonb
),
(
    'lru-cache',
    'LRU Cache',
    'Medium',
    34.2,
    ARRAY['Design', 'Hash Table', 'Linked List', 'Doubly Linked List'],
    '# LRU Cache

Design a data structure that follows the constraints of a **[Least Recently Used (LRU) cache](https://en.wikipedia.org/wiki/Cache_replacement_policies#LRU)**.

Implement the `LRUCache` class:
* `LRUCache(int capacity)` Initialize the LRU cache with positive size `capacity`.
* `int get(int key)` Return the value of the `key` if the key exists, otherwise return `-1`.
* `void put(int key, int value)` Update the value of the `key` if the `key` exists. Otherwise, add the `key-value` pair to the cache. If the number of keys exceeds the `capacity` from this operation, **evict** the least recently used key.

The functions `get` and `put` must each run in `O(1)` average time complexity.
',
    '{"python": "class LRUCache:\n\n    def __init__(self, capacity: int):\n        pass\n\n    def get(self, key: int) -> int:\n        pass\n\n    def put(self, key: int, value: int) -> None:\n        pass", "javascript": "/**\n * @param {number} capacity\n */\nvar LRUCache = function(capacity) {\n    \n};\n\n/** \n * @param {number} key\n * @return {number}\n */\nLRUCache.prototype.get = function(key) {\n    \n};\n\n/** \n * @param {number} key \n * @param {number} value\n * @return {void}\n */\nLRUCache.prototype.put = function(key, value) {\n    \n};"}'::jsonb
),
(
    'trapping-rain-water',
    'Trapping Rain Water',
    'Hard',
    28.9,
    ARRAY['Array', 'Two Pointers', 'Dynamic Programming', 'Stack'],
    '# Trapping Rain Water

Given `n` non-negative integers representing an elevation map where the width of each bar is `1`, compute how much water it can trap after raining.

**Example 1:**
```
Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]
Output: 6
Explanation: The above elevation map (black section) is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water (blue section) are being trapped.
```
',
    '{"python": "def trap(height: List[int]) -> int:\n    pass", "javascript": "/**\n * @param {number[]} height\n * @return {number}\n */\nvar trap = function(height) {\n    \n};"}'::jsonb
),
(
    'median-of-two-sorted-arrays',
    'Median of Two Sorted Arrays',
    'Hard',
    35.1,
    ARRAY['Array', 'Binary Search', 'Divide and Conquer'],
    '# Median of Two Sorted Arrays

Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the median of the two sorted arrays.

The overall run time complexity should be `O(log (m+n))`.

**Example 1:**
```
Input: nums1 = [1,3], nums2 = [2]
Output: 2.00000
Explanation: merged array = [1,2,3] and median is 2.
```

**Example 2:**
```
Input: nums1 = [1,2], nums2 = [3,4]
Output: 2.50000
Explanation: merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.
```
',
    '{"python": "def findMedianSortedArrays(nums1: List[int], nums2: List[int]) -> float:\n    pass", "javascript": "/**\n * @param {number[]} nums1\n * @param {number[]} nums2\n * @return {number}\n */\nvar findMedianSortedArrays = function(nums1, nums2) {\n    \n};", "cpp": "class Solution {\npublic:\n    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n        \n    }\n};"}'::jsonb
),
(
    'merge-k-sorted-lists',
    'Merge K Sorted Lists',
    'Hard',
    49.2,
    ARRAY['Linked List', 'Divide and Conquer', 'Heap', 'Merge Sort'],
    '# Merge K Sorted Lists

You are given an array of `k` linked-lists `lists`, each linked-list is sorted in ascending order.

*Merge all the linked-lists into one sorted linked-list and return it.*

**Example 1:**
```
Input: lists = [[1,4,5],[1,3,4],[2,6]]
Output: [1,1,2,3,4,4,5,6]
Explanation: The linked-lists are:
[
  1->4->5,
  1->3->4,
  2->6
]
merging them into one sorted list:
1->1->2->3->4->4->5->6
```
',
    '{"python": "def mergeKLists(lists: List[Optional[ListNode]]) -> Optional[ListNode]:\n    pass", "javascript": "/**\n * Definition for singly-linked list.\n * function ListNode(val, next) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.next = (next===undefined ? null : next)\n * }\n */\n/**\n * @param {ListNode[]} lists\n * @return {ListNode}\n */\nvar mergeKLists = function(lists) {\n    \n};"}'::jsonb
),
(
    'valid-parentheses',
    'Valid Parentheses',
    'Easy',
    40.3,
    ARRAY['String', 'Stack'],
    '# Valid Parentheses

Given a string `s` containing just the characters `''('', '')'', ''{'', ''}'', ''['' and '']''`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

**Example 1:**
```
Input: s = "()"
Output: true
```
',
    '{"python": "def isValid(s: str) -> bool:\n    pass", "javascript": "/**\n * @param {string} s\n * @return {boolean}\n */\nvar isValid = function(s) {\n    \n};"}'::jsonb
);
