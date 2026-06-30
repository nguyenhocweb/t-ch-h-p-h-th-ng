<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ChiSoBMIController extends Controller
{
    public function chiSoBMI($weigh, $height)
    {
        $bmi = $weigh / ($height * $height);
        $bmi = round($bmi, 1); //làm tròn đến 1 chữ số sau dấu phẩy
        echo "Chỉ số BMI của bạn là: " . $bmi . "<br>";
        if($bmi < 18.5) {
            echo "Nhẹ cân<br>Bạn ăn nhiều vào nhé!<br>";

        } else if($bmi <= 24.9 ) {
            echo "Cân nặng bạn bình thường <3<br>Ăn chơi thoải mái bạn nhé!<br>";
        } else if($bmi < 30) {
            echo "Hơi mập rồi bạn<br>Hãy suy nghĩ đến việc tập thể dục đi bạn!";
        } else if($bmi <= 34.9 ) {
            echo "Bạn đã có level rồi, bạn mâp lv1 :)<br>Crush bạn bắt đầu xa bạn rồi đấy!<br>";
        } else if($bmi <= 39.9 ) {
            echo "Bạn có mức béo phì là lv 2 :(<br>Còn cứu được, hãy bắt đầu tập pickleball :D<br>";
        } else {
            echo "Trân trọng thông báo, bạn mập lv MAX!<br>Giấc mơ của bạn là gì!<br>";
        }
        $minWeigh = 18.5 * ($height*$height);   //số cân tối thiểu để BMI bình thường
        $maxWeigh = 24.9 * ($height*$height);   //số cân tối đa để BMI bình thường
        //lấy một số sau dấu phẩy
        $minWeigh = round($minWeigh, 1);
        $maxWeigh = round($maxWeigh, 1);
         if($weigh < $minWeigh) {       //cân nặng của bạn nhỏ hơn mức bình thường
             $need = $minWeigh - $weigh;
             echo "Bạn cần tăng " . $need . " kg để đạt BMI bình thường<br>";
         } else if($weigh > $maxWeigh) {
             $need = $weigh - $maxWeigh;
             echo "Bạn cần giảm " . $need . " kg để đạt BMI bình thường<br>";
         } else {
             echo "Cân nặng bạn trong khoảng ổn định";
         }
    }
    // public function tinhCanNang($weigh, $height)
    // {
    //    $minWeigh = 18.5 * ($height*$height);
    //    $maxWeigh = 24.9 * ($height*$height);
    //    $minWeigh = round($minWeigh, 1);
    //    $maxWeigh = round($maxWeigh, 1);
    //     if($weigh < $minWeigh) {
    //         $need = $minWeigh - $weigh;
    //         echo "Bạn cần tăng " . $need . "để đạt BMI bình thường<br>";
    //     } else if($weigh > $maxWeigh) {
    //         $need = $weigh - $maxWeigh;
    //         echo "Bạn cần giảm " . $need . "để đạt BMI bình thường<br>";
    //     } else {
    //         echo "Cân nặng bạn trong khoảng ổn định";
    //     }

   // }

}
