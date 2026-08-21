import 'package:flutter/material.dart';
import '../../core/services/audio_service.dart';

class GummyButton extends StatefulWidget {
  final Widget child;
  final VoidCallback? onPressed;
  final Color color;
  final Color shadowColor;
  final double height;
  final double? width;
  final EdgeInsetsGeometry padding;
  final BorderRadius? borderRadius;

  const GummyButton({
    super.key,
    required this.child,
    required this.onPressed,
    this.color = const Color(0xFF6C3FB5),
    this.shadowColor = const Color(0xFF4A2D80),
    this.height = 54,
    this.width,
    this.padding = const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
    this.borderRadius,
  });

  @override
  State<GummyButton> createState() => _GummyButtonState();
}

class _GummyButtonState extends State<GummyButton> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  bool _isPressed = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 120),
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.94).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _onTapDown(TapDownDetails details) {
    if (widget.onPressed == null) return;
    setState(() => _isPressed = true);
    _controller.forward();
    AudioService().playPop();
  }

  void _onTapUp(TapUpDetails details) {
    if (widget.onPressed == null) return;
    setState(() => _isPressed = false);
    _controller.reverse();
    widget.onPressed?.call();
  }

  void _onTapCancel() {
    setState(() => _isPressed = false);
    _controller.reverse();
  }

  @override
  Widget build(BuildContext context) {
    final radius = widget.borderRadius ?? BorderRadius.circular(999);

    return GestureDetector(
      onTapDown: _onTapDown,
      onTapUp: _onTapUp,
      onTapCancel: _onTapCancel,
      child: ScaleTransition(
        scale: _scaleAnimation,
        child: Container(
          width: widget.width,
          height: widget.height,
          decoration: BoxDecoration(
            color: widget.color,
            borderRadius: radius,
            boxShadow: [
              BoxShadow(
                color: widget.shadowColor,
                offset: Offset(0, _isPressed ? 2 : 5),
                blurRadius: 0,
              ),
              if (!_isPressed)
                BoxShadow(
                  color: widget.color.withOpacity(0.35),
                  offset: const Offset(0, 8),
                  blurRadius: 16,
                ),
            ],
          ),
          padding: widget.padding,
          alignment: Alignment.center,
          child: widget.child,
        ),
      ),
    );
  }
}
