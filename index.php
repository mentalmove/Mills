<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Nine Men's Morris</title>
        
        <link rel="stylesheet" href="styles/elements.css">
        <script type="text/javascript" src="js/utilities.js"></script>

    </head>
    <body style="background-color: silver">

        <div id="base">
            <div class="element">
                <div class="bordered small"></div>
                <div class="bordered small" style="left: 50%"></div>
                <div class="bordered small" style="top: 50%"></div>
                <div class="bordered small" style="left: 50%; top: 50%"></div>
                <div class="outer bordered"></div>
                <div class="element">
                    <div class="element bordered" id="middle">
                        <div class="element">
                            <div class="element bordered inner" id="inner"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <script type="text/javascript" src="view_model/rules.js"></script>
        
        <script type="text/javascript" src="view/interface.js"></script>
        <script type="text/javascript" src="view/generate.js"></script>
        
    </body>
</html>
