<?php
    header("Content-Type: text/javascript");
    
    function v ($x) {
        //echo "<pre>";
        print_r($x);
        //echo "</pre>";
    }

    class NineMenSMorris {
        
        private $board;
        private $anticipated;
        
        
        private function reply ($fnc, $argument) {
            echo $fnc . "('" . $argument . "');";
        }
        
        private function coloured_collection ($tabu = Array(), $colour = 1) {
            
            $collection = Array();
            
            for ( $i = 0; $i < count($this->board); $i++ ) {
                if ( $this->board[$i] != $colour )
                    continue;
                if ( in_array($i, $tabu) )
                    continue;
                $collection[] = $i;
            }
            
            return $collection;
        }
        private function not_in_mill_collection () {
            
            $tabu = Array();
            
            for ( $i = 1; $i < count($this->board); $i += 2 ) {
                
                if ( $this->board[$i] != 1 )
                    continue;
                
                $tmp = $i % 8;
                if ( $this->board[$tmp] == 1 && $this->board[$tmp + 8] == 1 && $this->board[$tmp + 16] == 1 ) {
                    $tabu[] = $tmp;
                    $tabu[] = $tmp + 8;
                    $tabu[] = $tmp + 16;
                }
                $trio = Array( ($i - 1), $i, ($i + 1) );
                if ( $this->board[$trio[0]] == 1 && $this->board[$trio[1]] == 1 && $this->board[$trio[2]] == 1 ) {
                    $tabu[] = $trio[0];
                    $tabu[] = $trio[1];
                    $tabu[] = $trio[2];
                }
            }
            
            return $this->coloured_collection($tabu);
        }
        
        private function anticipate ($result) {
            
            for ( $i = 0; $i < 3; $i++ ) {
                for ( $j = 0; $j < 8; $j += 2 ) {
                    $x = $i * 8 + $j;
                    $y = $x + 1;
                    $z = $i * 8 + ($y + 1) % 8;
                    $test = $this->board[$x] + $this->board[$y] + $this->board[$z];
                    $this->anticipated = Array($x, $y, $z);
                    if ( $test == $result ) {
                        if ( !$this->board[$x] )
                            return $x;
                        if ( !$this->board[$y] )
                            return $y;
                        if ( !$this->board[$z] )
                            return $z;
                    }
                }
            }
            
            for ( $x = 1; $x < 8; $x += 2 ) {
                $y = $x + 8;
                $z = $y + 8;
                $test = $this->board[$x] + $this->board[$y] + $this->board[$z];
                $this->anticipated = Array($x, $y, $z);
                if ( $test == $result ) {
                    if ( !$this->board[$x] )
                        return $x;
                    if ( !$this->board[$y] )
                        return $y;
                    if ( !$this->board[$z] )
                        return $z;
                }
            }
            
            $this->anticipated = Array();
            
            return -1;
        }
        

        private function begin () {
            $index = $this->anticipate(-2);
            if ( $index == -1 )
                $index = $this->anticipate(2);
            while ($this->board[$index] || $index < 0) {
                $index = rand(0, count($this->board) - 1);
                if ( $index % 2 == 0 && rand(0, 2) )
                    $index = -1;
            }
            echo "rules.set_piece(" . $index . ", 'black');";
        }
        private function move () {
            $black_pieces = $this->coloured_collection(Array(), -1);
            shuffle($black_pieces);
            $black_indices = Array();
            for ( $i = 0; $i < count($black_pieces); $i++ ) {
                $tmp = Array();
                $black_indices[$black_pieces[$i]] = $tmp;
            }            
            foreach ( $black_indices as $key => $value ) {
                $tmp = ($key % 8) ? $key - 1 : $key + 7;
                if ( !$this->board[$tmp] )
                    $black_indices[$key][] = $tmp;
                $tmp = ($key % 8 != 7) ? $key + 1 : $key - 7;
                if ( !$this->board[$tmp] )
                    $black_indices[$key][] = $tmp;
                if ( $key % 2 ) {
                    if ( $key - 8 >= 0 ) {
                        $tmp = $key - 8;
                        if ( !$this->board[$tmp] )
                            $black_indices[$key][] = $tmp;
                    }
                    if ( $key + 8 < count($this->board) ) {
                        $tmp = $key + 8;
                        if ( !$this->board[$tmp] )
                            $black_indices[$key][] = $tmp;
                    }
                }
            }
            $found = Array();
            $wanted_black = $this->anticipate(-2);
            if ( $wanted_black >= 0 ) {
                foreach ( $black_indices as $key => $value ) {
                    if ( in_array($wanted_black, $value) && !in_array($key, $this->anticipated) ) {
                        $found = Array($key, $wanted_black);
                        break;
                    }
                }
            }
            $unwanted_white = $this->anticipate(2);
            if ( empty($found) && $unwanted_white >= 0 ) {
                foreach ( $black_indices as $key => $value ) {
                    if ( in_array($unwanted_white, $value) ) {
                        $found = Array($key, $unwanted_white);
                        break;
                    }
                }
            }
            if ( empty($found) ) {
                foreach ( $black_indices as $key => $value ) {
                    if ( empty($value) )
                        continue;
                    $random = rand(0, count($value) - 1);
                    $found = Array($key, $value[$random]);
                    break;
                }
            }
            if ( empty($found) )
                echo "rules.game_end( 'white' );";
            else
                echo "rules.swap_pieces(" . $found[0] . ", " . $found[1] . ", 'black');";
        }
        private function jump () {
            $black_pieces = $this->coloured_collection(Array(), -1);
            shuffle($black_pieces);
            $wanted_black = $this->anticipate(-2);
            if ( !empty($this->anticipated) && $wanted_black != -1 ) {
                for ( $i = 0; $i < count($this->anticipated); $i++ ) {
                    if ( !in_array($black_pieces[$i], $this->anticipated) ) {
                        echo "rules.swap_pieces(" . $black_pieces[$i] . ", " . $wanted_black . ", 'black');";
                        return;
                    }
                }
            }
            $unwanted_white = $this->anticipate(2);
            if ( !empty($this->anticipated) && $unwanted_white != -1 ) {
                for ( $i = 0; $i < count($this->anticipated); $i++ ) {
                    if ( !in_array($black_pieces[$i], $this->anticipated) ) {
                        echo "rules.swap_pieces(" . $black_pieces[$i] . ", " . $unwanted_white . ", 'black');";
                        return;
                    }
                }
            }
            $empties = $this->coloured_collection(Array(), 0);
            shuffle($empties);
            echo "rules.swap_pieces(" . $black_pieces[0] . ", " . $empties[0] . ", 'black');";
        }
        private function remove () {
            $collection = $this->not_in_mill_collection();
            if ( !count($collection) )
                $collection = $this->coloured_collection();
            $random = rand(0, count($collection) - 1);
            $index = $collection[$random];
            echo "rules.remove_piece(" . $index . ", 'white');";
        }
        
        
        public function __construct ($board, $phase) {
            $this->board = explode(",", $board);
            switch ($phase) {
                case "begin":
                    $this->begin();
                break;
                case "move":
                    $this->move();
                break;
                case "jump":
                    $this->jump();
                break;
                case "remove":
                    $this->remove();
                break;
                default:
                    $this->reply("console.log", $board);
            }
        }
    }
    
    if ( isset($_GET) && $_GET && isset($_GET['board']) && $_GET['board'] && isset($_GET['phase']) && $_GET['phase'] )
        new NineMenSMorris($_GET['board'], $_GET['phase']);
?>
