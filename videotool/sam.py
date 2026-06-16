
import numpy as np
import cv2
from segment_anything import sam_model_registry, SamPredictor
import sys
import json
from tool import *

class SAMInteractiveSegmenter:
    def __init__(self, data, model_type="vit_h", checkpoint_path="sam_vit_h_4b8939.pth"):
        self.device = "mps"
        # 加载模型
        sam = sam_model_registry[model_type](checkpoint=checkpoint_path)
        sam.to(device=self.device)
        self.predictor = SamPredictor(sam)
        self.image =base64_to_cv2(data["image_path"])
        self.image_rgb = cv2.cvtColor(self.image, cv2.COLOR_BGR2RGB)
        self.predictor.set_image(self.image_rgb)

        masks, scores, logits = self.predictor.predict(
                # point_coords= np.array( data["points"]),
                # point_labels=np.array(data["labels"]),
                box=np.array(data["box"])  ,
                multimask_output=True,
            )
           # 选择置信度最高的掩码
        best_idx = np.argmax(scores)
        best_mask = masks[best_idx]

        base64data = mask_to_base64(best_mask)

        print("--完成--")
       # 正确写法：外层单引号，内层双引号
        print(f'{{"base64": "{base64data}"}}')




# 1. 读取所有传入的数据
input_data = sys.stdin.read()
data = json.loads(input_data)


segmenter = SAMInteractiveSegmenter(model_type="vit_h",data=data, checkpoint_path="/Users/zhangfei/Desktop/diffusers/sam_vit_h_4b8939.pth")

